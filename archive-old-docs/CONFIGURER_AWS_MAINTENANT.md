# Configuration AWS - Action Immediate

## AWS CLI est Installe !

Maintenant, configurez vos credentials AWS.

## Etape 1 : Ouvrir un NOUVEAU PowerShell

**IMPORTANT** : Fermez cette fenetre PowerShell et ouvrez-en une nouvelle pour que AWS CLI soit reconnu.

## Etape 2 : Configurer AWS CLI

Dans le nouveau PowerShell, executer :

```powershell
aws configure
```

## Etape 3 : Entrer vos Credentials

Quand demande, entrer :

```
AWS Access Key ID [None]: VOTRE_ACCESS_KEY_ID
AWS Secret Access Key [None]: VOTRE_SECRET_ACCESS_KEY
Default region name [None]: eu-west-1
Default output format [None]: json
```

**Remplacer** `VOTRE_ACCESS_KEY_ID` et `VOTRE_SECRET_ACCESS_KEY` par vos vraies credentials.

## Etape 4 : Verifier

```powershell
aws sts get-caller-identity
```

Resultat attendu :
```json
{
  "UserId": "...",
  "Account": "004843574253",
  "Arn": "arn:aws:iam::004843574253:user/..."
}
```

Si vous voyez votre Account ID `004843574253`, c'est bon !

## Etape 5 : Lancer le Deploiement

Une fois configure, executer :

```powershell
cd "c:\Users\rtard\OneDrive - RT LOGISTIQUE\RT Technologie\RT-Technologie"

# Creer l'infrastructure
bash scripts/setup-aws-infrastructure.sh

# Migrer les secrets
bash scripts/setup-aws-secrets.sh

# Deployer
bash scripts/deploy-aws-ecs.sh
```

## Alternative : Configuration Manuelle des Fichiers

Si `aws configure` ne fonctionne pas, creer manuellement :

### Fichier 1 : Credentials

Creer : `C:\Users\rtard\.aws\credentials`

Contenu :
```
[default]
aws_access_key_id = VOTRE_ACCESS_KEY_ID
aws_secret_access_key = VOTRE_SECRET_ACCESS_KEY
```

### Fichier 2 : Config

Creer : `C:\Users\rtard\.aws\config`

Contenu :
```
[default]
region = eu-west-1
output = json
```

## Prochaine Etape

Apres configuration, suivez le guide :
[GUIDE_DEPLOIEMENT_AWS_PRODUCTION.md](GUIDE_DEPLOIEMENT_AWS_PRODUCTION.md)

---

**Action immediate** : Ouvrir un nouveau PowerShell et executer `aws configure`
