Workflow normal pour la suite

À chaque nouveau produit :

node scripts/add-product.js

git add .
git commit -m "add product"
git push


git add .
git commit -m "update product card + add product"
git push


git add .
git commit -m "update product card"
git push

Les points importants dans cette version :

toutes les images sortent maintenant avec le même format
il n’y a plus de double logique incohérente selon le type d’image
on n’agrandit plus les petites images
le produit est centré avec une marge propre
le script reste autonome, sans toucher à ton front

Si après test tu trouves encore que certaines images sont un peu trop proches des bords, augmente juste :

const PADDING_X = 70;
const PADDING_Y = 55;

par exemple en :

const PADDING_X = 90;
const PADDING_Y = 70;

Je veux dire :

le produit peut apparaître visuellement trop grand dans la zone image, donc :

presque collé en haut
presque collé à gauche/droite
presque collé en bas

Même si techniquement il n’est pas coupé.

Exemple concret

Imagine ta frame image comme un cadre.

Si ton script met l’objet avec très peu de marge autour, tu auras une impression de :

zoom
manque d’air
rendu “serré”

Donc “trop proche des bords” =
pas assez d’espace vide entre le produit et les limites de la frame.

Dans ton script, ça dépend de ça
const PADDING_X = 70;
const PADDING_Y = 55;
PADDING_X = marge gauche/droite
PADDING_Y = marge haut/bas
Si tu augmentes :
const PADDING_X = 90;
const PADDING_Y = 70;

le produit sera :

plus petit dans la frame
plus aéré
moins “zoomé”
Si tu diminues :
const PADDING_X = 40;
const PADDING_Y = 30;

le produit sera :

plus grand
plus proche des bords
plus “rempli”
Donc en résumé

“trop proche des bords” ne veut pas dire “coupé” forcément.

Ça veut dire :

l’image remplit trop la carte et respire pas assez