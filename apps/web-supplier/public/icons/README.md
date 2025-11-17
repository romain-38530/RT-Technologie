# Icons PWA

Ce dossier doit contenir les icônes pour la Progressive Web App.

## Fichiers requis

- `icon-192x192.png` - Icône 192x192px (Android)
- `icon-512x512.png` - Icône 512x512px (Android, splash screen)
- `apple-touch-icon.png` - Icône 180x180px (iOS)
- `badge-72x72.png` - Badge pour notifications 72x72px

## Génération

Vous pouvez générer ces icônes à partir d'un logo SVG ou PNG haute résolution en utilisant :

1. **Online**: https://realfavicongenerator.net/
2. **CLI**: `pwa-asset-generator`

```bash
npx pwa-asset-generator logo.svg ./public/icons
```

## Design Guidelines

- Fond transparent ou couleur de marque
- Design simple et reconnaissable
- Contraste élevé pour la lisibilité
- Respect des safe zones (padding ~10%)

## Référence dans manifest.json

Les icônes sont déjà référencées dans `/public/manifest.json`:

```json
{
  "icons": [
    {
      "src": "/icon-192x192.png",
      "sizes": "192x192",
      "type": "image/png"
    },
    {
      "src": "/icon-512x512.png",
      "sizes": "512x512",
      "type": "image/png"
    }
  ]
}
```
