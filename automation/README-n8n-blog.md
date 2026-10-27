# n8n : écrire un article de blog après une séance

Tu remplis un formulaire, Claude écrit un brouillon en français, anglais et arabe, et GitHub prépare un aperçu du site. **Rien n'est publié tant que tu n'as pas cliqué sur « Merge ».**

## Comment ça marche

1. Formulaire n8n : sujet, recherche Google visée, catégorie, séance liée, tes notes, photo de couverture.
2. Claude écrit l'article dans les 3 langues, avec des règles strictes : il n'invente rien, il n'utilise aucun tiret cadratin, il reste dans ton ton.
3. n8n vérifie le texte, enlève les tirets s'il en reste, et crée le fichier de l'article.
4. n8n crée une branche sur GitHub, y ajoute l'article et ouvre une demande de fusion (pull request).
5. GitHub construit les pages (workflow « Build site pages »), puis Vercel publie un aperçu.
6. Tu relis l'aperçu. Si c'est bon : **Merge pull request**. L'article est en ligne quelques minutes après.

## Installation (une seule fois)

### 1. Importer le workflow
Dans n8n : **Workflows → Import from file** → choisis `automation/n8n-blog-article.json`.

### 2. Créer les deux identifiants (Credentials)
Les deux sont de type **Header Auth**.

- **Anthropic API key**
  - Name : `x-api-key`
  - Value : ta clé API Anthropic (console.anthropic.com → API Keys)
- **GitHub token (website1.2)**
  - Name : `Authorization`
  - Value : `Bearer ` suivi d'un token GitHub
  - Pour créer le token : GitHub → Settings → Developer settings → Personal access tokens → **Fine-grained tokens** → accès au seul dépôt `Mrxa69K/website1.2`, avec les droits **Contents : Read and write** et **Pull requests : Read and write**.

Ensuite, ouvre chaque nœud HTTP du workflow et choisis le bon identifiant dans la liste (Claude → Anthropic, les 4 nœuds GitHub → GitHub token).

### 3. Autoriser GitHub à construire les pages
Dépôt GitHub → **Settings → Actions → General → Workflow permissions** → **Read and write permissions** → Save.
Sans ce réglage, l'aperçu ne contient pas le nouvel article.

### 4. Activer le workflow
Bouton **Active** en haut à droite. Le nœud « Formulaire : nouvel article » donne l'adresse du formulaire (Production URL). Garde-la dans tes favoris.

## Conseils pour de bons articles

- **Tes notes font l'article.** Claude n'invente rien : plus tu donnes de détails vrais (lieu, heure, météo, réaction, ce que tu conseillerais), meilleur est le texte.
- **Une recherche par article.** Exemples tirés des vraies recherches Google :
  - « photographe demande en mariage Paris »
  - « shooting photo couple Paris tour Eiffel »
  - « photographe femme mariage musulman »
  - « paris photoshoot outfits » (pour les touristes)
- **Photo de couverture** : une photo déjà sur le site, par exemple `/images/shop/proposal-16.webp`. Pour une nouvelle photo, ajoute-la d'abord dans `WEBSITE/final-version/images/shop/` (en .webp, 1000 px de haut maximum).
- **Toujours relire l'arabe et l'anglais** dans l'aperçu avant de fusionner.
- Rythme conseillé : **2 articles par mois**.

## Si quelque chose ne marche pas

- **« Claude n'a pas renvoyé un JSON valide »** : relance le formulaire, ça arrive rarement.
- **Erreur 401 ou 403 sur GitHub** : le token a expiré ou n'a pas les bons droits (point 2).
- **Erreur 422 « Reference already exists »** : un article du même nom a déjà été créé aujourd'hui. Change un peu le sujet.
- **L'aperçu n'affiche pas l'article** : vérifie le point 3, puis l'onglet **Actions** du dépôt.
