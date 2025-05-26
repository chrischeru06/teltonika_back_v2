const express = require('express');
const assureur_routes = require('./assureur.routes');
const marque_routes = require('./marque.routes');
const modele_routes = require('./model.routes');
const proprietaire_routes = require('./proprietaire.routes');
const model_routes = require('./model.routes');
const shift_routes = require('./shift.routes');
const colline_routes = require('./syst_colline.routes');
const commune_routes = require('./syst_commune.routes');
const zone_routes = require('./syst_zone.routes');
const province_routes = require('./syst_province.routes');
const type_proprio_routes = require('./type_proprietaire.routes');
const type_proprio_moral_routes = require('./type_proprietaire_moral.routes');
const countries_routes = require('./countries.routes');
const vehicule_routes = require('./vehicule.routes');
const chauffeur_routes = require('./chauffeur.routes');
const zonesdelimitation_routes = require('./zone_affect.routes');
const auth_routes = require('./auth.routes');
const user_routes = require('./user.routes');
const profil_routes = require('./profil.routes');
const tracking_routes = require('./tracking.routes');
const operateur_resau_routes = require('./operateur_resau.routes');
const realtime_routes = require('./realtimedata.routes');
const adminRouter = express.Router();

adminRouter.use('/assureur', assureur_routes)
adminRouter.use('/realtime', realtime_routes)
adminRouter.use('/marque', marque_routes)
adminRouter.use('/proprietaire', proprietaire_routes)
adminRouter.use('/model', model_routes)
adminRouter.use('/shift', shift_routes)
adminRouter.use('/colline', colline_routes)
adminRouter.use('/commune', commune_routes)
adminRouter.use('/zone', zone_routes)
adminRouter.use('/type_proprio', type_proprio_routes)
adminRouter.use('/type_proprio_moral', type_proprio_moral_routes)
adminRouter.use('/province', province_routes)
adminRouter.use('/modele', modele_routes)
adminRouter.use('/countries', countries_routes)
adminRouter.use('/vehicule', vehicule_routes)
adminRouter.use('/chauffeur', chauffeur_routes)
adminRouter.use('/zonedelimitation', zonesdelimitation_routes)
adminRouter.use('/auth', auth_routes)
adminRouter.use('/utilisateur', user_routes)
adminRouter.use('/profil', profil_routes)
adminRouter.use('/tracking', tracking_routes)
adminRouter.use('/operateur', operateur_resau_routes)

module.exports = adminRouter

