const ACTIVITY_LOGS_TYPES = {
   /**
     1 creation de l'utilisateur
     */
   CREATE_USER: 1,

   /**
    2 modification  de l'utilisateur
    */
   UPDATE_USER: 2,

   /**
    3 suppression de l'utilisateur
    */
   DELETE_USER: 3,

   /**
    4 activation l'utilisateur
    */
   ENABLE_USER: 4,

   /**
    5 desactivation de l'utilisateur
    */
   DISABLE_USER: 5,

   /**
    6 creation du profile
    */
   CREATE_PROFIL: 6,
   /**
    7 modification du profile
    */
   UPDATE_PROFIL: 7,

   /**
    8 suppression du profile
    */
   DELETE_PROFIL: 8,

   /**
    9 creation une configuration
    */
   CREATE_CONFIG: 9,

   /**
    10 suppression d'une configuration
    */
   DELETE_CONFIG: 10,
   /**
    11 modification d'une configuration
    */
   UPDATE_CONFIG: 11,

   /**
    12 activation d'une configuration
    */
   ENABLE_CONFIG: 12,

   /**
    13 desactivation d'une configuration
    */
   DISABLE_CONFIG: 13,

   /**
    14 creation d'un chauffeur
    */

   CREATE_DRIVER: 14,

   /**
   15 modification d'un chauffeur
   */
   UPDATE_DRIVER: 15,
   /**
   16 suppression d'un chauffeur
   */
   DELETE_DRIVER: 16,

   /**
      17 activation d'un chauffeur
      */
   ENABLE_DRIVER: 17,

   /**
      18 desactivation d'un chauffeur
      */
   DISABLE_DRIVER: 18,

   /**
      19 creation d'un client
      */
   CREATE_RIDER: 19,

   /**
      20 modification d'un client
      */
   UPDATE_RIDER: 20,

   /**
      21 suppression d'un client
      */
   DELETE_RIDER: 21,
   /**
      22 creation d'une vehicule
      */

   CREATE_VEHICLE: 22,

   /**
      23 modification d'un vehicule
      */
   UPDATE_VEHICLE: 23,

   /**
      24 suppression d'un vehicule
      */

   DELETE_VEHICLE: 24,
   /**
    25 assigner  d'un vehicule a un chauffeur
    */

   ASSIGN_DRIVER_VEHICLE: 25,

   /**
      26 modification du trajet
      */
   UPDATE_TRIP: 26,

   /**
      27 annulation du trajet
      */
   CANCEL_TRIP: 27,
   /**
    28 le trajet termine
    */

   COMPLETE_TRIP: 28,

   /**
    29 suppression du trajet
    */

   DELETE_TRIP: 29,

   /**
    30 comfirmation du trajet
    */

   CONFIRM_TRIP: 30,

   /**
      31 validation du trajet
      */
   VALIDATE_TRIP: 31,

   /**
      32 Portefeuilles des chauffeurs paiement
      */
   PAY_DRIVER_WALLET: 32,

   /**
      33 Creation de la transaction
      */
   CREATE_TRANSACT_DRIVER: 33,

   /**
      34 rejeter la transaction
      */
   REJECT_TRANSACT_DRIVER: 34,

   /**
      35 rejeter la transaction
      */
   APPROVE_TRANSACT_DRIVER: 35,

   /**
      36 Supprimer l'historique de paiement des chauffeurs
      */
   DELETE_TRANSACT_DRIVER: 36,

   /**
      37 Deposer Portefeuilles des clients
      */
   DEPOSIT_RIDER_WALLET: 37,

   /**
      38 Creation de la transaction du client
      */
   CREATE_TRANSACT_RIDER: 38,

   /**
      39 rejeter la transaction du client
      */
   REJECT_TRANSACT_RIDER: 39,

   /**
      40 rejeter la transaction du client
      */
   APPROVE_TRANSACT_RIDER: 40,

   /**
      41 Traiter une plainte
      */
   PROCESS_PLAINTE: 41,

   /**
      42 Creer une promotion
      */
   CREATE_PROMOTION: 42,

   /**
      43 Modifier une promotion
      */
   UPDATE_PROMOTION: 43,

   /**
      44 Supprimer une promotion
      */
   DELETE_PROMOTION: 44,

   /**
      45 Assigner chauffeur a une reservation
      */
   ASSIGN_DRIVER_RESERVATION: 45,

   /**
      46 Creer une permanence
      */
   CREATE_PERMANENCE: 46,
   /**
      47 Modofier une permanence
      */
   UPDATE_PERMANENCE: 47,

   /**
      48 Supprimer une permanence
      */
   DELETE_PERMANENCE: 48,

   /**
      49 Creer une categorie
      */
   CREATE_CATEGORIE: 49,

   /**
      50 Modofier une categorie
      */
   UPDATE_CATEGORIE: 50,

   /**
      51 Supprimer une categorie
      */
   DELETE_CATEGORIE: 51,

   /**
      52 Creer un corporate
      */
   CREATE_CORPORATE: 52,

   /**
      53 Modifier un corporate
      */
   EDIT_CORPORATE: 53,

   /**
      54 Supprimer un corporate
      */
   DELETE_CORPORATE: 54,

   /**
      55 Creer une facture
      */
   CREATE_FACTURE: 55,

   /**
      56 Activer le statut du paiement de la facture
      */
   ENABLE_FACTURE: 56,

   /**
      57 Desactiver le statut du paiement de la facture
      */
   DISABLE_FACTURE: 57,

   /**
      58 Supprimer la facture
      */
   DELETE_FACTURE: 58,

   /**
      59 active promotion
      */
   ENABLE_PROMOTION: 59,

   /**
      60 desactive promotion
      */
   DESABLE_PROMOTION: 60,

   /**
      61 Annuler une reservation
      */
   CANCEL_RESERVATION: 61,
}

module.exports = ACTIVITY_LOGS_TYPES
