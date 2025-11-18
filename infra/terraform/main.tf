# ============================================================================
# RT-Technologie - Infrastructure AWS Terraform Configuration
# ============================================================================
# Description: Complete AWS infrastructure for RT-Technologie platform
# Author: RT-Technologie DevOps Team
# Version: 1.0.0
# Date: 2025-11-18
# ============================================================================

terraform {
  required_version = ">= 1.5.0"

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }

  # Backend pour stocker le state Terraform
  backend "s3" {
    bucket         = "rt-terraform-state"
    key            = "production/terraform.tfstate"
    region         = "eu-west-3"
    encrypt        = true
    dynamodb_table = "rt-terraform-locks"
  }
}

# ============================================================================
# VARIABLES
# ============================================================================

variable "environment" {
  description = "Environment name (dev, staging, production)"
  type        = string
  default     = "production"
}

variable "aws_region" {
  description = "AWS region"
  type        = string
  default     = "eu-west-3" # Paris
}

variable "project_name" {
  description = "Project name"
  type        = string
  default     = "rt-technologie"
}

variable "domain_name" {
  description = "Root domain name"
  type        = string
  default     = "rt-technologie.com"
}

variable "vpc_cidr" {
  description = "VPC CIDR block"
  type        = string
  default     = "10.0.0.0/16"
}

variable "availability_zones" {
  description = "Availability zones"
  type        = list(string)
  default     = ["eu-west-3a", "eu-west-3b"]
}

variable "instance_type" {
  description = "EC2 instance type for backend services"
  type        = string
  default     = "t3.medium" # 2 vCPU, 4GB RAM
}

variable "min_instances" {
  description = "Minimum number of EC2 instances in auto-scaling group"
  type        = number
  default     = 2
}

variable "max_instances" {
  description = "Maximum number of EC2 instances in auto-scaling group"
  type        = number
  default     = 10
}

variable "mongodb_atlas_ip_whitelist" {
  description = "IP addresses to whitelist for MongoDB Atlas"
  type        = list(string)
  default     = [] # Will be populated with NAT Gateway IPs
}

variable "ssh_key_name" {
  description = "SSH key pair name for EC2 instances"
  type        = string
  default     = "rt-prod-key"
}

variable "enable_rds" {
  description = "Enable RDS PostgreSQL instance"
  type        = bool
  default     = false # Optional, only if needed
}

variable "tags" {
  description = "Common tags for all resources"
  type        = map(string)
  default = {
    Project     = "RT-Technologie"
    ManagedBy   = "Terraform"
    Environment = "production"
  }
}

# ============================================================================
# PROVIDER
# ============================================================================

provider "aws" {
  region = var.aws_region

  default_tags {
    tags = var.tags
  }
}

# ============================================================================
# DATA SOURCES
# ============================================================================

# Latest Amazon Linux 2023 AMI
data "aws_ami" "amazon_linux_2023" {
  most_recent = true
  owners      = ["amazon"]

  filter {
    name   = "name"
    values = ["al2023-ami-*-x86_64"]
  }

  filter {
    name   = "virtualization-type"
    values = ["hvm"]
  }
}

# Current AWS account ID
data "aws_caller_identity" "current" {}

# ============================================================================
# VPC & NETWORKING
# ============================================================================

# VPC
resource "aws_vpc" "main" {
  cidr_block           = var.vpc_cidr
  enable_dns_hostnames = true
  enable_dns_support   = true

  tags = {
    Name = "${var.project_name}-${var.environment}-vpc"
  }
}

# Internet Gateway
resource "aws_internet_gateway" "main" {
  vpc_id = aws_vpc.main.id

  tags = {
    Name = "${var.project_name}-${var.environment}-igw"
  }
}

# Public Subnets (2 AZs)
resource "aws_subnet" "public" {
  count                   = length(var.availability_zones)
  vpc_id                  = aws_vpc.main.id
  cidr_block              = cidrsubnet(var.vpc_cidr, 8, count.index)
  availability_zone       = var.availability_zones[count.index]
  map_public_ip_on_launch = true

  tags = {
    Name = "${var.project_name}-${var.environment}-public-${count.index + 1}"
    Type = "public"
  }
}

# Private Subnets (2 AZs)
resource "aws_subnet" "private" {
  count             = length(var.availability_zones)
  vpc_id            = aws_vpc.main.id
  cidr_block        = cidrsubnet(var.vpc_cidr, 8, count.index + 10)
  availability_zone = var.availability_zones[count.index]

  tags = {
    Name = "${var.project_name}-${var.environment}-private-${count.index + 1}"
    Type = "private"
  }
}

# Elastic IPs for NAT Gateways
resource "aws_eip" "nat" {
  count  = length(var.availability_zones)
  domain = "vpc"

  tags = {
    Name = "${var.project_name}-${var.environment}-nat-eip-${count.index + 1}"
  }

  depends_on = [aws_internet_gateway.main]
}

# NAT Gateways (High Availability)
resource "aws_nat_gateway" "main" {
  count         = length(var.availability_zones)
  allocation_id = aws_eip.nat[count.index].id
  subnet_id     = aws_subnet.public[count.index].id

  tags = {
    Name = "${var.project_name}-${var.environment}-nat-${count.index + 1}"
  }

  depends_on = [aws_internet_gateway.main]
}

# Public Route Table
resource "aws_route_table" "public" {
  vpc_id = aws_vpc.main.id

  route {
    cidr_block = "0.0.0.0/0"
    gateway_id = aws_internet_gateway.main.id
  }

  tags = {
    Name = "${var.project_name}-${var.environment}-public-rt"
  }
}

# Public Route Table Association
resource "aws_route_table_association" "public" {
  count          = length(var.availability_zones)
  subnet_id      = aws_subnet.public[count.index].id
  route_table_id = aws_route_table.public.id
}

# Private Route Tables (one per AZ for NAT)
resource "aws_route_table" "private" {
  count  = length(var.availability_zones)
  vpc_id = aws_vpc.main.id

  route {
    cidr_block     = "0.0.0.0/0"
    nat_gateway_id = aws_nat_gateway.main[count.index].id
  }

  tags = {
    Name = "${var.project_name}-${var.environment}-private-rt-${count.index + 1}"
  }
}

# Private Route Table Association
resource "aws_route_table_association" "private" {
  count          = length(var.availability_zones)
  subnet_id      = aws_subnet.private[count.index].id
  route_table_id = aws_route_table.private[count.index].id
}

# ============================================================================
# SECURITY GROUPS
# ============================================================================

# ALB Security Group
resource "aws_security_group" "alb" {
  name_prefix = "${var.project_name}-${var.environment}-alb-"
  description = "Security group for Application Load Balancer"
  vpc_id      = aws_vpc.main.id

  ingress {
    description = "HTTPS from internet"
    from_port   = 443
    to_port     = 443
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  ingress {
    description = "HTTP from internet (redirect to HTTPS)"
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  egress {
    description = "Allow all outbound"
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name = "${var.project_name}-${var.environment}-alb-sg"
  }

  lifecycle {
    create_before_destroy = true
  }
}

# EC2 Backend Security Group
resource "aws_security_group" "backend" {
  name_prefix = "${var.project_name}-${var.environment}-backend-"
  description = "Security group for backend EC2 instances"
  vpc_id      = aws_vpc.main.id

  # Allow services ports from ALB
  ingress {
    description     = "Services ports from ALB"
    from_port       = 3001
    to_port         = 3018
    protocol        = "tcp"
    security_groups = [aws_security_group.alb.id]
  }

  # SSH from bastion (if exists) or VPN
  ingress {
    description = "SSH from bastion/VPN"
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = ["10.0.0.0/16"] # Within VPC only
  }

  egress {
    description = "Allow all outbound (MongoDB Atlas, APIs, etc.)"
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name = "${var.project_name}-${var.environment}-backend-sg"
  }

  lifecycle {
    create_before_destroy = true
  }
}

# RDS Security Group (if enabled)
resource "aws_security_group" "rds" {
  count       = var.enable_rds ? 1 : 0
  name_prefix = "${var.project_name}-${var.environment}-rds-"
  description = "Security group for RDS PostgreSQL"
  vpc_id      = aws_vpc.main.id

  ingress {
    description     = "PostgreSQL from backend"
    from_port       = 5432
    to_port         = 5432
    protocol        = "tcp"
    security_groups = [aws_security_group.backend.id]
  }

  egress {
    description = "No outbound needed"
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = []
  }

  tags = {
    Name = "${var.project_name}-${var.environment}-rds-sg"
  }

  lifecycle {
    create_before_destroy = true
  }
}

# ============================================================================
# IAM ROLES & POLICIES
# ============================================================================

# EC2 Instance Role
resource "aws_iam_role" "ec2_backend" {
  name_prefix = "${var.project_name}-${var.environment}-ec2-"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
          Service = "ec2.amazonaws.com"
        }
      }
    ]
  })

  tags = {
    Name = "${var.project_name}-${var.environment}-ec2-role"
  }
}

# EC2 Instance Profile
resource "aws_iam_instance_profile" "ec2_backend" {
  name_prefix = "${var.project_name}-${var.environment}-ec2-"
  role        = aws_iam_role.ec2_backend.name
}

# Policy: S3 Access
resource "aws_iam_role_policy" "ec2_s3" {
  name_prefix = "s3-access-"
  role        = aws_iam_role.ec2_backend.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "s3:GetObject",
          "s3:PutObject",
          "s3:DeleteObject",
          "s3:ListBucket"
        ]
        Resource = [
          aws_s3_bucket.documents.arn,
          "${aws_s3_bucket.documents.arn}/*",
          aws_s3_bucket.images.arn,
          "${aws_s3_bucket.images.arn}/*",
          aws_s3_bucket.backups.arn,
          "${aws_s3_bucket.backups.arn}/*"
        ]
      }
    ]
  })
}

# Policy: CloudWatch Logs
resource "aws_iam_role_policy" "ec2_cloudwatch" {
  name_prefix = "cloudwatch-logs-"
  role        = aws_iam_role.ec2_backend.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "logs:CreateLogGroup",
          "logs:CreateLogStream",
          "logs:PutLogEvents",
          "logs:DescribeLogStreams"
        ]
        Resource = "arn:aws:logs:${var.aws_region}:${data.aws_caller_identity.current.account_id}:log-group:/aws/ec2/${var.project_name}-*"
      }
    ]
  })
}

# Policy: Secrets Manager
resource "aws_iam_role_policy" "ec2_secrets" {
  name_prefix = "secrets-manager-"
  role        = aws_iam_role.ec2_backend.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "secretsmanager:GetSecretValue",
          "secretsmanager:DescribeSecret"
        ]
        Resource = "arn:aws:secretsmanager:${var.aws_region}:${data.aws_caller_identity.current.account_id}:secret:${var.project_name}/${var.environment}/*"
      }
    ]
  })
}

# Policy: SES Send Email
resource "aws_iam_role_policy" "ec2_ses" {
  name_prefix = "ses-send-"
  role        = aws_iam_role.ec2_backend.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "ses:SendEmail",
          "ses:SendRawEmail"
        ]
        Resource = "*"
      }
    ]
  })
}

# ============================================================================
# S3 BUCKETS
# ============================================================================

# Documents Bucket (CMR, invoices, contracts)
resource "aws_s3_bucket" "documents" {
  bucket_prefix = "${var.project_name}-${var.environment}-documents-"

  tags = {
    Name = "${var.project_name}-${var.environment}-documents"
    Type = "documents"
  }
}

resource "aws_s3_bucket_versioning" "documents" {
  bucket = aws_s3_bucket.documents.id

  versioning_configuration {
    status = "Enabled"
  }
}

resource "aws_s3_bucket_server_side_encryption_configuration" "documents" {
  bucket = aws_s3_bucket.documents.id

  rule {
    apply_server_side_encryption_by_default {
      sse_algorithm = "AES256"
    }
  }
}

resource "aws_s3_bucket_lifecycle_configuration" "documents" {
  bucket = aws_s3_bucket.documents.id

  rule {
    id     = "archive-old-documents"
    status = "Enabled"

    transition {
      days          = 90
      storage_class = "GLACIER"
    }

    expiration {
      days = 2555 # 7 years (compliance)
    }
  }
}

# Images Bucket (palettes, avatars)
resource "aws_s3_bucket" "images" {
  bucket_prefix = "${var.project_name}-${var.environment}-images-"

  tags = {
    Name = "${var.project_name}-${var.environment}-images"
    Type = "images"
  }
}

resource "aws_s3_bucket_server_side_encryption_configuration" "images" {
  bucket = aws_s3_bucket.images.id

  rule {
    apply_server_side_encryption_by_default {
      sse_algorithm = "AES256"
    }
  }
}

# Backups Bucket
resource "aws_s3_bucket" "backups" {
  bucket_prefix = "${var.project_name}-${var.environment}-backups-"

  tags = {
    Name = "${var.project_name}-${var.environment}-backups"
    Type = "backups"
  }
}

resource "aws_s3_bucket_versioning" "backups" {
  bucket = aws_s3_bucket.backups.id

  versioning_configuration {
    status = "Enabled"
  }
}

resource "aws_s3_bucket_lifecycle_configuration" "backups" {
  bucket = aws_s3_bucket.backups.id

  rule {
    id     = "archive-backups"
    status = "Enabled"

    transition {
      days          = 30
      storage_class = "GLACIER"
    }

    expiration {
      days = 365
    }
  }
}

# Block public access for all buckets
resource "aws_s3_bucket_public_access_block" "documents" {
  bucket = aws_s3_bucket.documents.id

  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

resource "aws_s3_bucket_public_access_block" "images" {
  bucket = aws_s3_bucket.images.id

  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

resource "aws_s3_bucket_public_access_block" "backups" {
  bucket = aws_s3_bucket.backups.id

  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

# ============================================================================
# CLOUDFRONT CDN
# ============================================================================

# Origin Access Control for S3
resource "aws_cloudfront_origin_access_control" "documents" {
  name                              = "${var.project_name}-${var.environment}-documents-oac"
  description                       = "OAC for documents bucket"
  origin_access_control_origin_type = "s3"
  signing_behavior                  = "always"
  signing_protocol                  = "sigv4"
}

resource "aws_cloudfront_origin_access_control" "images" {
  name                              = "${var.project_name}-${var.environment}-images-oac"
  description                       = "OAC for images bucket"
  origin_access_control_origin_type = "s3"
  signing_behavior                  = "always"
  signing_protocol                  = "sigv4"
}

# CloudFront Distribution - Documents
resource "aws_cloudfront_distribution" "documents" {
  enabled             = true
  is_ipv6_enabled     = true
  comment             = "${var.project_name} ${var.environment} documents CDN"
  price_class         = "PriceClass_100" # EU + North America
  aliases             = ["cdn-docs.${var.domain_name}"]

  origin {
    domain_name              = aws_s3_bucket.documents.bucket_regional_domain_name
    origin_id                = "S3-${aws_s3_bucket.documents.id}"
    origin_access_control_id = aws_cloudfront_origin_access_control.documents.id
  }

  default_cache_behavior {
    allowed_methods        = ["GET", "HEAD", "OPTIONS"]
    cached_methods         = ["GET", "HEAD"]
    target_origin_id       = "S3-${aws_s3_bucket.documents.id}"
    viewer_protocol_policy = "redirect-to-https"
    compress               = true
    min_ttl                = 0
    default_ttl            = 86400  # 1 day
    max_ttl                = 604800 # 7 days

    forwarded_values {
      query_string = false
      cookies {
        forward = "none"
      }
    }
  }

  restrictions {
    geo_restriction {
      restriction_type = "none"
    }
  }

  viewer_certificate {
    acm_certificate_arn      = aws_acm_certificate.main.arn
    ssl_support_method       = "sni-only"
    minimum_protocol_version = "TLSv1.2_2021"
  }

  tags = {
    Name = "${var.project_name}-${var.environment}-documents-cdn"
  }
}

# CloudFront Distribution - Images
resource "aws_cloudfront_distribution" "images" {
  enabled             = true
  is_ipv6_enabled     = true
  comment             = "${var.project_name} ${var.environment} images CDN"
  price_class         = "PriceClass_100"
  aliases             = ["cdn-img.${var.domain_name}"]

  origin {
    domain_name              = aws_s3_bucket.images.bucket_regional_domain_name
    origin_id                = "S3-${aws_s3_bucket.images.id}"
    origin_access_control_id = aws_cloudfront_origin_access_control.images.id
  }

  default_cache_behavior {
    allowed_methods        = ["GET", "HEAD", "OPTIONS"]
    cached_methods         = ["GET", "HEAD"]
    target_origin_id       = "S3-${aws_s3_bucket.images.id}"
    viewer_protocol_policy = "redirect-to-https"
    compress               = true
    min_ttl                = 0
    default_ttl            = 604800  # 7 days
    max_ttl                = 31536000 # 1 year

    forwarded_values {
      query_string = false
      cookies {
        forward = "none"
      }
    }
  }

  restrictions {
    geo_restriction {
      restriction_type = "none"
    }
  }

  viewer_certificate {
    acm_certificate_arn      = aws_acm_certificate.main.arn
    ssl_support_method       = "sni-only"
    minimum_protocol_version = "TLSv1.2_2021"
  }

  tags = {
    Name = "${var.project_name}-${var.environment}-images-cdn"
  }
}

# S3 Bucket Policy for CloudFront
resource "aws_s3_bucket_policy" "documents_cloudfront" {
  bucket = aws_s3_bucket.documents.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Sid    = "AllowCloudFrontServicePrincipal"
        Effect = "Allow"
        Principal = {
          Service = "cloudfront.amazonaws.com"
        }
        Action   = "s3:GetObject"
        Resource = "${aws_s3_bucket.documents.arn}/*"
        Condition = {
          StringEquals = {
            "AWS:SourceArn" = aws_cloudfront_distribution.documents.arn
          }
        }
      }
    ]
  })
}

resource "aws_s3_bucket_policy" "images_cloudfront" {
  bucket = aws_s3_bucket.images.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Sid    = "AllowCloudFrontServicePrincipal"
        Effect = "Allow"
        Principal = {
          Service = "cloudfront.amazonaws.com"
        }
        Action   = "s3:GetObject"
        Resource = "${aws_s3_bucket.images.arn}/*"
        Condition = {
          StringEquals = {
            "AWS:SourceArn" = aws_cloudfront_distribution.images.arn
          }
        }
      }
    ]
  })
}

# ============================================================================
# ACM CERTIFICATE (SSL/TLS)
# ============================================================================

# Certificate must be in us-east-1 for CloudFront
provider "aws" {
  alias  = "us_east_1"
  region = "us-east-1"
}

resource "aws_acm_certificate" "main" {
  domain_name               = var.domain_name
  subject_alternative_names = ["*.${var.domain_name}"]
  validation_method         = "DNS"

  lifecycle {
    create_before_destroy = true
  }

  tags = {
    Name = "${var.project_name}-${var.environment}-cert"
  }
}

# ============================================================================
# APPLICATION LOAD BALANCER
# ============================================================================

resource "aws_lb" "main" {
  name               = "${var.project_name}-${var.environment}-alb"
  internal           = false
  load_balancer_type = "application"
  security_groups    = [aws_security_group.alb.id]
  subnets            = aws_subnet.public[*].id

  enable_deletion_protection = var.environment == "production" ? true : false
  enable_http2               = true
  enable_cross_zone_load_balancing = true

  tags = {
    Name = "${var.project_name}-${var.environment}-alb"
  }
}

# HTTPS Listener
resource "aws_lb_listener" "https" {
  load_balancer_arn = aws_lb.main.arn
  port              = "443"
  protocol          = "HTTPS"
  ssl_policy        = "ELBSecurityPolicy-TLS-1-2-2017-01"
  certificate_arn   = aws_acm_certificate.main.arn

  default_action {
    type = "fixed-response"
    fixed_response {
      content_type = "application/json"
      message_body = jsonencode({ error = "Not Found" })
      status_code  = "404"
    }
  }
}

# HTTP Listener (redirect to HTTPS)
resource "aws_lb_listener" "http" {
  load_balancer_arn = aws_lb.main.arn
  port              = "80"
  protocol          = "HTTP"

  default_action {
    type = "redirect"
    redirect {
      port        = "443"
      protocol    = "HTTPS"
      status_code = "HTTP_301"
    }
  }
}

# Target Groups for each service
locals {
  services = {
    admin-gateway  = 3008
    authz          = 3007
    core-orders    = 3001
    notifications  = 3002
    planning       = 3004
    tms-sync       = 3003
    ecpmr          = 3009
    vigilance      = 3006
    palette        = 3011
    affret-ia      = 3005
    training       = 3012
    storage-market = 3013
    pricing-grids  = 3014
    tracking-ia    = 3015
    bourse         = 3016
    wms-sync       = 3017
    erp-sync       = 3018
  }
}

resource "aws_lb_target_group" "services" {
  for_each = local.services

  name_prefix = substr("${each.key}-", 0, 6)
  port        = each.value
  protocol    = "HTTP"
  vpc_id      = aws_vpc.main.id
  target_type = "instance"

  health_check {
    enabled             = true
    path                = "/health"
    port                = "traffic-port"
    protocol            = "HTTP"
    healthy_threshold   = 2
    unhealthy_threshold = 3
    timeout             = 5
    interval            = 30
    matcher             = "200"
  }

  deregistration_delay = 30

  tags = {
    Name    = "${var.project_name}-${var.environment}-${each.key}-tg"
    Service = each.key
  }

  lifecycle {
    create_before_destroy = true
  }
}

# Listener Rules (path-based routing)
resource "aws_lb_listener_rule" "admin_gateway" {
  listener_arn = aws_lb_listener.https.arn
  priority     = 100

  action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.services["admin-gateway"].arn
  }

  condition {
    path_pattern {
      values = ["/admin/*"]
    }
  }
}

resource "aws_lb_listener_rule" "authz" {
  listener_arn = aws_lb_listener.https.arn
  priority     = 110

  action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.services["authz"].arn
  }

  condition {
    path_pattern {
      values = ["/auth/*", "/api/auth/*"]
    }
  }
}

resource "aws_lb_listener_rule" "core_orders" {
  listener_arn = aws_lb_listener.https.arn
  priority     = 120

  action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.services["core-orders"].arn
  }

  condition {
    path_pattern {
      values = ["/api/orders/*"]
    }
  }
}

# Add more listener rules for other services...

# ============================================================================
# LAUNCH TEMPLATE
# ============================================================================

# User data script
locals {
  user_data = <<-EOF
    #!/bin/bash
    set -e

    # Update system
    dnf update -y

    # Install Node.js 20
    dnf install -y nodejs npm git

    # Install pnpm
    npm install -g pnpm pm2

    # Install CloudWatch Logs agent
    dnf install -y amazon-cloudwatch-agent

    # Clone repository
    cd /opt
    git clone https://github.com/YOUR_ORG/rt-technologie.git
    cd rt-technologie

    # Install dependencies
    pnpm install --frozen-lockfile

    # Build services
    pnpm build

    # Create .env from AWS Secrets Manager
    aws secretsmanager get-secret-value \
      --secret-id ${var.project_name}/${var.environment}/env \
      --region ${var.aws_region} \
      --query SecretString \
      --output text > .env

    # Start services with PM2
    pm2 start /opt/rt-technologie/infra/scripts/pm2-ecosystem.config.js
    pm2 save
    pm2 startup systemd -u root --hp /root

    # Configure CloudWatch Logs
    cat > /opt/aws/amazon-cloudwatch-agent/etc/config.json <<'CWCONFIG'
    {
      "logs": {
        "logs_collected": {
          "files": {
            "collect_list": [
              {
                "file_path": "/root/.pm2/logs/*.log",
                "log_group_name": "/aws/ec2/${var.project_name}-backend",
                "log_stream_name": "{instance_id}"
              }
            ]
          }
        }
      }
    }
    CWCONFIG

    /opt/aws/amazon-cloudwatch-agent/bin/amazon-cloudwatch-agent-ctl \
      -a fetch-config \
      -m ec2 \
      -c file:/opt/aws/amazon-cloudwatch-agent/etc/config.json \
      -s

    echo "RT-Technologie backend services started!"
  EOF
}

resource "aws_launch_template" "backend" {
  name_prefix   = "${var.project_name}-${var.environment}-backend-"
  image_id      = data.aws_ami.amazon_linux_2023.id
  instance_type = var.instance_type
  key_name      = var.ssh_key_name

  iam_instance_profile {
    name = aws_iam_instance_profile.ec2_backend.name
  }

  vpc_security_group_ids = [aws_security_group.backend.id]

  user_data = base64encode(local.user_data)

  monitoring {
    enabled = true
  }

  metadata_options {
    http_endpoint               = "enabled"
    http_tokens                 = "required" # IMDSv2
    http_put_response_hop_limit = 1
  }

  tag_specifications {
    resource_type = "instance"
    tags = {
      Name = "${var.project_name}-${var.environment}-backend"
    }
  }

  lifecycle {
    create_before_destroy = true
  }
}

# ============================================================================
# AUTO SCALING GROUP
# ============================================================================

resource "aws_autoscaling_group" "backend" {
  name_prefix         = "${var.project_name}-${var.environment}-backend-asg-"
  vpc_zone_identifier = aws_subnet.public[*].id
  min_size            = var.min_instances
  max_size            = var.max_instances
  desired_capacity    = var.min_instances
  health_check_type   = "ELB"
  health_check_grace_period = 300

  launch_template {
    id      = aws_launch_template.backend.id
    version = "$Latest"
  }

  # Attach to all target groups
  target_group_arns = [for tg in aws_lb_target_group.services : tg.arn]

  tag {
    key                 = "Name"
    value               = "${var.project_name}-${var.environment}-backend"
    propagate_at_launch = true
  }

  lifecycle {
    create_before_destroy = true
    ignore_changes        = [desired_capacity]
  }
}

# Auto Scaling Policies
resource "aws_autoscaling_policy" "scale_up" {
  name                   = "${var.project_name}-${var.environment}-scale-up"
  autoscaling_group_name = aws_autoscaling_group.backend.name
  adjustment_type        = "ChangeInCapacity"
  scaling_adjustment     = 1
  cooldown               = 300
}

resource "aws_autoscaling_policy" "scale_down" {
  name                   = "${var.project_name}-${var.environment}-scale-down"
  autoscaling_group_name = aws_autoscaling_group.backend.name
  adjustment_type        = "ChangeInCapacity"
  scaling_adjustment     = -1
  cooldown               = 300
}

# CloudWatch Alarms for Auto Scaling
resource "aws_cloudwatch_metric_alarm" "cpu_high" {
  alarm_name          = "${var.project_name}-${var.environment}-cpu-high"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = "2"
  metric_name         = "CPUUtilization"
  namespace           = "AWS/EC2"
  period              = "120"
  statistic           = "Average"
  threshold           = "70"
  alarm_description   = "Scale up if CPU > 70%"
  alarm_actions       = [aws_autoscaling_policy.scale_up.arn]

  dimensions = {
    AutoScalingGroupName = aws_autoscaling_group.backend.name
  }
}

resource "aws_cloudwatch_metric_alarm" "cpu_low" {
  alarm_name          = "${var.project_name}-${var.environment}-cpu-low"
  comparison_operator = "LessThanThreshold"
  evaluation_periods  = "2"
  metric_name         = "CPUUtilization"
  namespace           = "AWS/EC2"
  period              = "120"
  statistic           = "Average"
  threshold           = "30"
  alarm_description   = "Scale down if CPU < 30%"
  alarm_actions       = [aws_autoscaling_policy.scale_down.arn]

  dimensions = {
    AutoScalingGroupName = aws_autoscaling_group.backend.name
  }
}

# ============================================================================
# RDS POSTGRESQL (Optional)
# ============================================================================

resource "aws_db_subnet_group" "main" {
  count      = var.enable_rds ? 1 : 0
  name_prefix = "${var.project_name}-${var.environment}-"
  subnet_ids = aws_subnet.private[*].id

  tags = {
    Name = "${var.project_name}-${var.environment}-db-subnet-group"
  }
}

resource "aws_db_instance" "postgres" {
  count                  = var.enable_rds ? 1 : 0
  identifier_prefix      = "${var.project_name}-${var.environment}-"
  engine                 = "postgres"
  engine_version         = "15.5"
  instance_class         = "db.t3.micro"
  allocated_storage      = 20
  max_allocated_storage  = 100
  storage_type           = "gp3"
  storage_encrypted      = true

  db_name  = "rt_analytics"
  username = "rtadmin"
  password = random_password.db_password[0].result

  multi_az               = true
  db_subnet_group_name   = aws_db_subnet_group.main[0].name
  vpc_security_group_ids = [aws_security_group.rds[0].id]

  backup_retention_period = 7
  backup_window           = "03:00-04:00"
  maintenance_window      = "sun:04:00-sun:05:00"

  skip_final_snapshot     = var.environment != "production"
  final_snapshot_identifier = var.environment == "production" ? "${var.project_name}-final-snapshot-${formatdate("YYYY-MM-DD-hhmm", timestamp())}" : null

  enabled_cloudwatch_logs_exports = ["postgresql", "upgrade"]

  tags = {
    Name = "${var.project_name}-${var.environment}-postgres"
  }
}

resource "random_password" "db_password" {
  count   = var.enable_rds ? 1 : 0
  length  = 32
  special = true
}

# ============================================================================
# ROUTE53 DNS
# ============================================================================

resource "aws_route53_zone" "main" {
  name = var.domain_name

  tags = {
    Name = "${var.project_name}-${var.environment}-zone"
  }
}

# API subdomain (ALB)
resource "aws_route53_record" "api" {
  zone_id = aws_route53_zone.main.zone_id
  name    = "api.${var.domain_name}"
  type    = "A"

  alias {
    name                   = aws_lb.main.dns_name
    zone_id                = aws_lb.main.zone_id
    evaluate_target_health = true
  }
}

# Auth subdomain (ALB)
resource "aws_route53_record" "auth" {
  zone_id = aws_route53_zone.main.zone_id
  name    = "auth.${var.domain_name}"
  type    = "A"

  alias {
    name                   = aws_lb.main.dns_name
    zone_id                = aws_lb.main.zone_id
    evaluate_target_health = true
  }
}

# CDN subdomains (CloudFront)
resource "aws_route53_record" "cdn_docs" {
  zone_id = aws_route53_zone.main.zone_id
  name    = "cdn-docs.${var.domain_name}"
  type    = "A"

  alias {
    name                   = aws_cloudfront_distribution.documents.domain_name
    zone_id                = aws_cloudfront_distribution.documents.hosted_zone_id
    evaluate_target_health = false
  }
}

resource "aws_route53_record" "cdn_img" {
  zone_id = aws_route53_zone.main.zone_id
  name    = "cdn-img.${var.domain_name}"
  type    = "A"

  alias {
    name                   = aws_cloudfront_distribution.images.domain_name
    zone_id                = aws_cloudfront_distribution.images.hosted_zone_id
    evaluate_target_health = false
  }
}

# ACM Certificate Validation
resource "aws_route53_record" "cert_validation" {
  for_each = {
    for dvo in aws_acm_certificate.main.domain_validation_options : dvo.domain_name => {
      name   = dvo.resource_record_name
      record = dvo.resource_record_value
      type   = dvo.resource_record_type
    }
  }

  allow_overwrite = true
  name            = each.value.name
  records         = [each.value.record]
  ttl             = 60
  type            = each.value.type
  zone_id         = aws_route53_zone.main.zone_id
}

resource "aws_acm_certificate_validation" "main" {
  certificate_arn         = aws_acm_certificate.main.arn
  validation_record_fqdns = [for record in aws_route53_record.cert_validation : record.fqdn]
}

# ============================================================================
# CLOUDWATCH MONITORING
# ============================================================================

# Log Group
resource "aws_cloudwatch_log_group" "backend" {
  name              = "/aws/ec2/${var.project_name}-backend"
  retention_in_days = 30

  tags = {
    Name = "${var.project_name}-${var.environment}-backend-logs"
  }
}

# SNS Topic for Alarms
resource "aws_sns_topic" "alarms" {
  name_prefix = "${var.project_name}-${var.environment}-alarms-"

  tags = {
    Name = "${var.project_name}-${var.environment}-alarms"
  }
}

resource "aws_sns_topic_subscription" "alarms_email" {
  topic_arn = aws_sns_topic.alarms.arn
  protocol  = "email"
  endpoint  = "devops@rt-technologie.com" # Change to your email
}

# ALB Unhealthy Targets Alarm
resource "aws_cloudwatch_metric_alarm" "unhealthy_targets" {
  alarm_name          = "${var.project_name}-${var.environment}-unhealthy-targets"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = "1"
  metric_name         = "UnHealthyHostCount"
  namespace           = "AWS/ApplicationELB"
  period              = "60"
  statistic           = "Average"
  threshold           = "0"
  alarm_description   = "Alert if any target is unhealthy"
  alarm_actions       = [aws_sns_topic.alarms.arn]

  dimensions = {
    LoadBalancer = aws_lb.main.arn_suffix
  }
}

# ============================================================================
# OUTPUTS
# ============================================================================

output "vpc_id" {
  description = "VPC ID"
  value       = aws_vpc.main.id
}

output "alb_dns_name" {
  description = "ALB DNS name"
  value       = aws_lb.main.dns_name
}

output "alb_zone_id" {
  description = "ALB Zone ID"
  value       = aws_lb.main.zone_id
}

output "nat_gateway_ips" {
  description = "NAT Gateway public IPs (for MongoDB Atlas whitelist)"
  value       = aws_eip.nat[*].public_ip
}

output "s3_bucket_documents" {
  description = "Documents S3 bucket name"
  value       = aws_s3_bucket.documents.id
}

output "s3_bucket_images" {
  description = "Images S3 bucket name"
  value       = aws_s3_bucket.images.id
}

output "s3_bucket_backups" {
  description = "Backups S3 bucket name"
  value       = aws_s3_bucket.backups.id
}

output "cloudfront_documents_domain" {
  description = "CloudFront documents domain"
  value       = aws_cloudfront_distribution.documents.domain_name
}

output "cloudfront_images_domain" {
  description = "CloudFront images domain"
  value       = aws_cloudfront_distribution.images.domain_name
}

output "route53_zone_id" {
  description = "Route53 hosted zone ID"
  value       = aws_route53_zone.main.zone_id
}

output "route53_name_servers" {
  description = "Route53 name servers"
  value       = aws_route53_zone.main.name_servers
}

output "rds_endpoint" {
  description = "RDS PostgreSQL endpoint"
  value       = var.enable_rds ? aws_db_instance.postgres[0].endpoint : null
}

output "acm_certificate_arn" {
  description = "ACM certificate ARN"
  value       = aws_acm_certificate.main.arn
}
