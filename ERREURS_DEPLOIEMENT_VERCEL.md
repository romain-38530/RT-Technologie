# ❌ Erreurs de Déploiement Vercel

**Date :** 2025-11-20
**Status :** 5/8 applications déployées

---

## ✅ Applications Déployées avec Succès (5/8)

| Application | URL | Status |
|-------------|-----|--------|
| web-industry | https://web-industry-rt-technologie.vercel.app | ✅ Production |
| web-transporter | https://web-transporter-rt-technologie.vercel.app | ✅ Production |
| web-logistician | https://web-logistician-rt-technologie.vercel.app | ✅ Production |
| backoffice-admin | https://backoffice-admin-rt-technologie.vercel.app | ✅ Production |
| marketing-site | https://marketing-site-rt-technologie.vercel.app | ✅ Production |

---

## ❌ Applications en Erreur (3/8)

### 1. web-recipient

**Erreur :** Tailwind CSS - classe `border-border` n'existe pas

```
Syntax error: The `border-border` class does not exist.
If `border-border` is a custom class, make sure it is defined within a `@layer` directive.

./src/app/globals.css:1:1
```

**Cause probable :**
- Configuration Tailwind CSS incomplète
- Variable CSS `--border` non définie
- Problème dans `tailwind.config.ts` ou `globals.css`

**Solution :**

1. **Vérifier `tailwind.config.ts` :**
```typescript
// apps/web-recipient/tailwind.config.ts
export default {
  theme: {
    extend: {
      colors: {
        border: "hsl(var(--border))",  // <-- Cette ligne est nécessaire
      }
    }
  }
}
```

2. **Vérifier `globals.css` :**
```css
/* apps/web-recipient/src/app/globals.css */
@layer base {
  :root {
    --border: 214.3 31.8% 91.4%;  /* <-- Cette variable est nécessaire */
  }
}
```

3. **Ou supprimer l'utilisation de `border-border` du code :**
```bash
# Rechercher où cette classe est utilisée
grep -r "border-border" apps/web-recipient/src/
```

---

### 2. web-supplier

**Erreur :** Identique à web-recipient - Tailwind CSS `border-border`

```
Syntax error: The `border-border` class does not exist.
./src/app/globals.css:1:1
```

**Solution :** Même correctif que pour web-recipient

---

### 3. web-forwarder

**Erreur :** TypeScript - problème avec le package `chatbot-widget`

```
Module parse failed: Unexpected token (14:7)
../../packages/chatbot-widget/src/index.tsx

export type {
  ChatMessage,
  ChatSession,
```

**Cause probable :**
- Next.js ne peut pas parser les exports TypeScript `export type`
- Le package `chatbot-widget` n'est pas correctement configuré pour être consommé par Next.js
- Manque de transpilation dans le monorepo

**Solution :**

1. **Option A : Corriger la configuration du package chatbot-widget**

```javascript
// packages/chatbot-widget/package.json
{
  "main": "./dist/index.js",
  "types": "./dist/index.d.ts",
  "exports": {
    ".": {
      "types": "./dist/index.d.ts",
      "import": "./dist/index.js",
      "require": "./dist/index.cjs"
    }
  }
}
```

Ajouter un build step pour compiler le package.

2. **Option B : Configurer Next.js pour transpiler chatbot-widget**

```javascript
// apps/web-forwarder/next.config.js
const nextConfig = {
  transpilePackages: ['@rt/chatbot-widget'],  // <-- Ajouter cette ligne
};
```

3. **Option C : Modifier l'export dans chatbot-widget**

```typescript
// packages/chatbot-widget/src/index.tsx
// Au lieu de:
export type { ChatMessage, ChatSession };

// Utiliser:
export type { ChatMessage, ChatSession } from './types';
// Ou séparer les exports runtime et types
```

---

## 🔧 Plan de Correction

### Priorité 1 : Corriger web-recipient et web-supplier (même erreur)

**Temps estimé :** 15 minutes

1. Vérifier la configuration Tailwind des 5 apps fonctionnelles
2. Copier la configuration correcte vers web-recipient et web-supplier
3. Relancer les builds

**Commandes :**
```bash
# Comparer les configurations
diff apps/web-industry/tailwind.config.ts apps/web-recipient/tailwind.config.ts
diff apps/web-industry/src/app/globals.css apps/web-recipient/src/app/globals.css

# Après correction, rebuilder
cd apps/web-recipient && pnpm build
cd apps/web-supplier && pnpm build
```

### Priorité 2 : Corriger web-forwarder (chatbot-widget)

**Temps estimé :** 30 minutes

1. Vérifier si chatbot-widget est utilisé dans les apps fonctionnelles
2. Ajouter `transpilePackages` dans next.config.js
3. Ou compiler chatbot-widget en package standalone

**Commandes :**
```bash
# Vérifier l'utilisation de chatbot-widget
grep -r "@rt/chatbot-widget" apps/*/src/

# Tester avec transpilePackages
cd apps/web-forwarder
# Modifier next.config.js
pnpm build
```

---

## 📊 Impact

**Applications déployées :** 5/8 (62,5%)

**Applications critiques manquantes :**
- web-recipient : Destinataires
- web-supplier : Fournisseurs
- web-forwarder : Transitaires

**Workaround temporaire :**
Les utilisateurs de ces 3 profils peuvent temporairement utiliser les applications existantes ou attendre la correction des builds.

---

## 🚀 Prochaines Étapes

1. ✅ **Backend AWS : 11/11 services déployés et opérationnels**
2. ✅ **MongoDB : Opérationnel**
3. ✅ **Vercel : 5/8 applications en production**
4. ⏳ **Corriger les 3 erreurs de build**
5. ⏳ **Configurer les variables d'environnement Vercel (8 apps)**
6. ⏳ **Tester la connexion frontend → backend**
7. ⏳ **Configurer CORS sur AWS ECS**

---

**Dernière mise à jour :** 2025-11-20 09:15 UTC
