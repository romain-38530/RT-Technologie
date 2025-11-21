# Script PowerShell pour récupérer les IPs des services ECS
# RT-Technologie

$Region = "eu-central-1"
$Cluster = "rt-technologie-cluster"
$Services = @(
    "client-onboarding",
    "core-orders",
    "affret-ia",
    "vigilance"
)

Write-Host "==================================" -ForegroundColor Cyan
Write-Host "Récupération des IPs des services" -ForegroundColor Cyan
Write-Host "==================================" -ForegroundColor Cyan
Write-Host ""

foreach ($Service in $Services) {
    Write-Host "Service: rt-$Service-service" -ForegroundColor Yellow

    # Get task ARN
    $TaskArn = aws ecs list-tasks `
        --cluster $Cluster `
        --service-name "rt-$Service-service" `
        --region $Region `
        --query 'taskArns[0]' `
        --output text 2>$null

    if ($TaskArn -and $TaskArn -ne "None") {
        # Get ENI ID
        $EniId = aws ecs describe-tasks `
            --cluster $Cluster `
            --tasks $TaskArn `
            --region $Region `
            --query 'tasks[0].attachments[0].details[?name==`networkInterfaceId`].value' `
            --output text 2>$null

        if ($EniId) {
            # Get Public IP
            $PublicIp = aws ec2 describe-network-interfaces `
                --network-interface-ids $EniId `
                --region $Region `
                --query 'NetworkInterfaces[0].Association.PublicIp' `
                --output text 2>$null

            if ($PublicIp) {
                Write-Host "  ✓ IP: $PublicIp" -ForegroundColor Green
            } else {
                Write-Host "  ✗ Pas d'IP publique trouvée" -ForegroundColor Red
            }
        } else {
            Write-Host "  ✗ ENI non trouvé" -ForegroundColor Red
        }
    } else {
        Write-Host "  ✗ Aucune tâche en cours" -ForegroundColor Red
    }
    Write-Host ""
}

Write-Host "==================================" -ForegroundColor Cyan
Write-Host "Commandes pour créer les secrets:" -ForegroundColor Cyan
Write-Host "==================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Allez sur https://vercel.com/dashboard" -ForegroundColor Yellow
Write-Host "Pour chaque projet, créez ces variables d'environnement:" -ForegroundColor Yellow
Write-Host ""
Write-Host "web-forwarder:" -ForegroundColor Cyan
Write-Host "  NEXT_PUBLIC_AFFRET_IA_URL = http://[IP_AFFRET_IA]:3010" -ForegroundColor White
Write-Host ""
Write-Host "marketing-site:" -ForegroundColor Cyan
Write-Host "  NEXT_PUBLIC_API_URL = http://[IP_CLIENT_ONBOARDING]:3020" -ForegroundColor White
Write-Host ""
