const { STSClient, GetCallerIdentityCommand } = require('@aws-sdk/client-sts');
const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');
const { SESv2Client, SendEmailCommand } = require('@aws-sdk/client-sesv2');

function cfg() {
  const region = process.env.AWS_REGION || 'eu-west-3';
  const credentials = (process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY)
    ? { accessKeyId: process.env.AWS_ACCESS_KEY_ID, secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY }
    : undefined; // use default chain/IMDS if not provided
  return { region, credentials };
}

function sts() { return new STSClient(cfg()); }
function s3() { return new S3Client(cfg()); }
function ses() { return new SESv2Client(cfg()); }

async function getCallerIdentity() {
  const client = sts();
  const out = await client.send(new GetCallerIdentityCommand({}));
  return out; // { UserId, Account, Arn }
}

async function s3PutObject({ bucket, key, body, contentType }) {
  const client = s3();
  await client.send(new PutObjectCommand({ Bucket: bucket, Key: key, Body: body, ContentType: contentType }));
  return { ok: true };
}

async function sesSendEmail({ from, to, subject, text }) {
  const client = ses();
  await client.send(new SendEmailCommand({
    FromEmailAddress: from,
    Destination: { ToAddresses: Array.isArray(to) ? to : [to] },
    Content: { Simple: { Subject: { Data: subject }, Body: { Text: { Data: text } } } }
  }));
  return { sent: true };
}

module.exports = { getCallerIdentity, s3PutObject, sesSendEmail };
