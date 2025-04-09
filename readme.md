# <a name="structure"></a> Structure

Bien structurer un projet Node.js avec Express offre plusieurs avantages, tels que la facilité de maintenance, la scalabilité, la lisibilité du code, et la facilité d'ajout de nouvelles fonctionnalités. Voici à quoi pourrait ressembler une bonne structure pour un projet Node.js avec Express :

<pre>
- class/
  ├─ uploads/
  │  └─ UsersUpload.js
  │  └─ AdminUpload.js
  ├─ Upload.js
  ├─ Validation.js
- config/
  ├─ lang/
  │  └─ en.json
  │  └─ fr.json
  ├─ keys/
  │  └─ firebase.json
  ├─ app.js
- constants/
  ├─ RESPONSE_CODES.js
  ├─ RESPONSE_STATUS.js
- controllers/
  ├─ auth/
  ├─ admin/
  ├─ service/
- crons/
  ├─ SENDING_PROMOTIONS_EMAILS.js
- middlewares/
  ├─ bindUser.js
  ├─ requireAuth.js.js
- models/
  ├─ User.js
- node_modules/
- public/
- routes/
  ├─ auth
  ├─ admin
  ├─ service
- socket/
  ├─ events.js
  ├─ index.js
- utils/
  ├─ sequerize.js
  ├─ randomInt.js
- views/
  ├─ emails
.env
.gitignore
package-lock.json
package.json
server.js
  </pre>

Voici une description détaillée de chaque répertoire et fichier :

- `class/`: Contient des classes qui sont utilisées dans l'application.
- `config/`: Contient des fichiers de configuration de l'application, notamment pour la gestion des langues et des clés d'API spécifiques à votre application.
- `constants/`: Dossier contenant des fichiers définissant des constantes pour l'application.
- `controllers/`: Dossier qui peut contenir des contrôleurs, des fichiers qui gèrent la logique de contrôle de votre application.
- `crons/`: Dossier qui peut contenir des fichiers liés à l'exécution de tâches cron, par exemple, pour l'automatisation de certaines actions.
- `middlewares/`: Dossier pour les middlewares, des fonctions intermédiaires qui peuvent être utilisées pour intercepter ou modifier des requêtes HTTP.
- `models/`: Dossier qui contient les définitions de modèles de données pour l'application.
- `node_modules/`: Dossier où les dépendances de votre projet sont installées par npm.
- `public/`: Dossier où vous placez des fichiers statiques tels que des images, des styles CSS et des scripts JavaScript, qui seront accessibles publiquement.
- `routes/`: Dossier qui peut contenir les fichiers de définition des routes pour votre application.
- `socket/`: Dossier qui peut contenir des fichiers liés à la gestion des sockets, utilisés pour la communication en temps réel.
- `utils/`: Dossier qui contient des utilitaires, par exemple, des fonctions ou des configurations réutilisables.
- `views/`: Dossier qui contient des fichiers de vue si votre application utilise un moteur de template.
- `.env`: Fichier de configuration pour les variables d'environnement.
- `.gitignore`: Fichier spécifiant les fichiers et répertoires à ignorer lors de la gestion de version avec Git.
- `package-lock.json`: Fichier généré par npm pour fixer les versions exactes des dépendances.
- `package.json`: Fichier de configuration de Node.js listant les métadonnées du projet et les dépendances.
- `server.js`: Fichier principal où le serveur Express est configuré et démarré.

# Liste de dépendances

|      Dépendance       |                                Description                                 |
| :-------------------: | :------------------------------------------------------------------------: |
|         axios         |                      Pour effectuer des request http                       |
|        bcrypt         |                      Pour cryptage des mots de passe                       |
| convert-excel-to-json |           Pour lire des fichiers excel et les convertir en json            |
|         cors          |                       Pour la configuration des cors                       |
|        dotenv         |                Pour la gestion des fichiers d'environnement                |
|          ejs          |                       Moteur de template pour nodejs                       |
|         i18n          |                            Internationalisation                            |
|     jsonwebtoken      |                   Gestion des tokens d'authentification                    |
|        moment         |                           Manipulation des dates                           |
|        mysql2         |                          Driver pour gerer mysql                           |
|      nodemailer       |                          Pour envoyer les emails                           |
|        nodemon        |            Gerer le hotrefresh apres enregistrement du fichier             |
|        pdfkit         |                          Generer des fichiers pdf                          |
|       sequelize       |                    ORM de gestion d'une base de donnees                    |
|         sharp         |                Manipulation des images comme la compression                |
|       socket.io       |                    Gestion des evenements en temps reel                    |
|  express-fileupload   | Un middleware pour express qui facilite la gestion de l'upload de fichiers |

# Règles a suivre

## Application

`Règle 1` : Il est strictement interdit de modifier la structure du projet, les fonctions ou classes prédéfinies de base, sauf s'il existe une raison valable et validée par la direction technique.

`Règle 2` : Avant d'ajouter un module, assurez-vous qu'il n'existe pas déjà un module défini répondant au même besoin.

`Règle 3` : Avant d'ajouter une fonction, assurez-vous qu'il n'existe pas déjà une fonction réalisant la même tâche.

## Nomenclature des fichiers

`Règle 4` : Le nom d'un fichier contenant une classe doit commencer par une lettre majuscule

`Règle 5` : Les constantes doivent toujours être écrites en majuscules.

`Règle 6`: Le nom d'un fichier de contrôleur doit être en minuscule underscore, suffixé par `.controller.js.` et porté le même nom que la table si possible

```
✅ utilisateur.controller.js
❌ utilisateuController.js
❌ utilisateu_controller.js
```

`Règle 7`: Les fichiers des crons doivent toujours être écrites en majuscules.

`Règle 8`: Les fichiers des middlewares doivent toujours être nommés en camelCase.

```
✅ requireAuth.js
❌ require_auth.js
❌ requireauth.js
```

`Règle 9`: Les fichiers des models doivent toujours commencer par une majuscule.

```
✅ Utilisateurs_tokens.js
❌ UtilisateursTokens.js
❌ utilisateurs_tokens.js
```

`Règle 10`: Les fichiers des models doivent être identique avec le nom de la table.

```js
// Pour la table "utilisateurs"
✅ Utilisateurs.js
❌ Utilisateur.js
❌ UtilisateursModel.js
```

`Règle 11`: Le nom d'un fichier des routes doit être en minuscule underscore, suffixé par `.routes.js.` et porté le même nom que la table si possible

```js
// Pour la table utilisateurs
✅ utilisateurs.routes.js
❌ utilisateursRoutes.js
❌ utilisateursroutes.js
```

`Règle 12`: Le nom d'un fichier de point d'entrée d'une route doit être nommé en camelCase et suffixé par `Router.js`

```
✅ adminRouter.js
❌ adminrouter.js
❌ adminrouter.js
```

`Règle 13`: Le nom de fichier d'un événement Socket doit être en majuscules et correspondre à l'événement auquel il est associé.

`Règle 14`: Le nom de fichier d'un test unitaire doit être en minuscule underscore et suffixé par `.test.js.`

```
✅ app.test.js
❌ appTest.js
❌ app_test.js
```

## Les controllers

`Règle 15`: Chaque fonction doit être commentée en suivant le format de <a href="https://jsdoc.app/">JSDoc</a>

```js
/**
 * Permet de creer un corporate
 * @date  10/07/2023
 * @param {express.Request} req
 * @param {express.Response} res
 * @author eloge257 <nirema.eloge@mdiabox.bi>
 */
const createUtilisateur = async (req, res) => {}
```

`Règle 16`: Les fonctions doivent être des fonctions fléchées (arrow functions).

```js
// ✅ Correct
const createUtilisateur = async (req, res) => {
   // code
}

// ❌ Incorrect
async function createUtilisateur(req, res) {
   //code
}
```

`Règle 17`: Chaque réponse HTTP doit être au format JSON, défini de la manière suivante :

```js
{
   statusCode: RESPONSE_CODES.OK, // Le code http de la réponse
   httpStatus: RESPONSE_STATUS.OK, // Le statut http de la réponse
   message: "Liste des agents", // Le message de la réponse
   result: [] // Les données
}
```

`Règle 18`: Les codes et statuts HTTP doivent provenir des constantes `RESPONSE_CODES` et `RESPONSE_STATUS`.

```js
// ✅ Correct
{
   statusCode: RESPONSE_CODES.OK,
   httpStatus: RESPONSE_STATUS.OK,
   message: "Liste des agents",
   result: []
}


// ❌ Incorrect
{
   statusCode: 404,
   httpStatus: "NO_TROUVE",
   message: "Liste des agents",
   result: []
}
```

## Les modeles

`Règle 19`: Le nom d'un alias dans les associations doit correspondre au nom de la table

```js
// ✅ Correct
Utilisateurs.belongsTo(Profils, { foreignKey: "ID_PROFIL", as: "profils" })

// ❌ Incorrect
Utilisateurs.belongsTo(Profils, { foreignKey: "ID_PROFIL", as: "profil" })

// ❌ Incorrect
Utilisateurs.belongsTo(Profils, { foreignKey: "ID_PROFIL", as: "utilisateur_profil" })
```

`Règle 20`: Les associations utilisant les mêmes modèles doivent être définies dans le même fichier de modèle afin d’éviter les problèmes de chargement avec Sequelize.

## Les routes

`Règle 21`: Les routes doivent toujours être en minuscules.

```js
// ✅ Correct
utilisateur_routes.post("/mis_a_jour", utilisateur_routes_controller.createUtilisateur)
utilisateur_routes.post("/process/validation_etape", utilisateur_routes_controller.createUtilisateur)

// ❌ Incorrect
utilisateur_routes.post("/misajour", utilisateur_routes_controller.createUtilisateur)
utilisateur_routes.post("/process/validationEtape", utilisateur_routes_controller.createUtilisateur)
```

`Règle 22`: Chaque route définie doit être commentée en suivant le format suivant :

```js
/**
 * Une route pour enregistrer un utilisateur
 * @method POST
 * @url /admin/utilisateurs
 */
utilisateur_routes.post("/", utilisateur_routes_controller.createUtilisateur)
```

## Contribution

### Lancer les tests localement

Pour lancer les test unitaires on utilise jest en executant cette commande:

```
npm run test
```

### Formatage du code source

Nous utilisons <a href="https://prettier.io/">Prettier</a> pour formater le code source

Vous pouvez formater automatiquement votre code en exécutant :

```
npx prettier . --write
```

### Linting/verifying votre code

Vous pouvez vérifier que votre code est correctement formaté et respecte le style de codage en exécutant :

```
npm run lint
```

### Guide des messages de commit

Nous avons des règles très précises sur la façon dont nos messages de commit Git doivent être formatés. Cela permet d'avoir des messages plus lisibles et faciles à suivre lors de l'exploration de l'historique du projet. Vous trouverez plus de détails sur ces règles <a href="https://gist.github.com/pmutua/7008c22908f89eb8bd21b36e4f92b04f">ici</a>

Voici le format d'un message de commit:

```
<type>(<scope>): <subject>
```

#### Type

Doit être l'un des suivants :

- build : Modifications affectant le système de build ou les dépendances externes (exemples de scopes : gulp, broccoli, npm).
- ci : Modifications des fichiers de configuration et scripts de l'intégration continue (exemples de scopes : Circle, BrowserStack, SauceLabs).
- docs : Modifications concernant uniquement la documentation.
- feat : Ajout d'une nouvelle fonctionnalité.
- fix : Correction d'un bug.
- perf : Modification du code visant à améliorer les performances.
- refactor : Modification du code qui ne corrige pas un bug et n'ajoute pas de nouvelle fonctionnalité.
- style : Modifications qui n'affectent pas le fonctionnement du code (espaces, formatage, points-virgules manquants, etc.).
- test : Ajout ou correction de tests existants.

#### scope

Scope est un module

#### subject

Le sujet contient une description succincte de la modification :

- Utilisez l'impératif au présent : "changer" et non "J'ai changeé" ou "les echanges".
- Ne mettez pas de majuscule à la première lettre.
- Ne terminez pas par un point (.).

Examples:

- ✅ feat(auth): ajouter la route pour reinitialiser le mot de passe
- ✅ fix(dashboard): corriger le probleme des donnees non correspondantes
- ✅ refactory(ihm): enlever les commentaires unitiles
