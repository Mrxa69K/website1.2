#!/bin/bash

# === CONFIGURATION ===
FAVICON_FILENAME="logo-paris-love-photography-horizontal.png"
FAVICON_PATH="images/$FAVICON_FILENAME"  # chemin relatif vers le logo

echo "🔍 Recherche des fichiers HTML..."
HTML_FILES=$(find . -name "*.html")

if [ ! -f "$FAVICON_PATH" ]; then
  echo "❌ Le favicon n'a pas été trouvé à l'emplacement : $FAVICON_PATH"
  exit 1
fi

for FILE in $HTML_FILES; do
  echo "✨ Traitement du fichier : $FILE"

  # Vérifie si le favicon est déjà présent
  grep -qi "$FAVICON_FILENAME" "$FILE" && {
    echo "   ➤ Déjà présent, on ignore."
    continue
  }

  # Injecter la balise <link rel="icon"...> avant la fermeture de <head>
  sed -i.bak "/<\/head>/i \  <link rel=\"icon\" type=\"image/png\" href=\"$FAVICON_PATH\">" "$FILE" && rm "$FILE.bak"

  echo "   ➤ Favicon ajouté !"
done

echo "✅ Terminé !"

