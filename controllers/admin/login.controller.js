const express = require("express");
const Validation = require("../../class/Validation");
const RESPONSE_CODES = require("../../constants/RESPONSE_CODES");
const RESPONSE_STATUS = require("../../constants/RESPONSE_STATUS");

// const generateToken = require("../../utils/generateToken");
const Utilisateurs = require("../../models/admin/Users");
const bcrypt = require("bcrypt");
const {
  APP_ACCESS_TOKEN_MAX_AGE,
} = require("../../config/app");

const jwt = require("jsonwebtoken");


/**
 * Permet de vérifier la connexion d'un utilisateur
 * @author deco257 <derick@mediabox.bi>
 * @param {express.Request} res
 * @param {express.Response} res
 */

const login = async (req, res) => {
  try {
    const {
      USER_NAME,
      PASSWORD,
    } = req.body;

    const validation = new Validation(
      req.body,
      {
        USER_NAME: {
          required: true,
          email: true,
        },
        PASSWORD: {
          required: true,
        },
      },
      {
        PASSWORD: {
          required: 'champs obligatoire',
        },
        USER_NAME: {
          required: "champs obligatoire",
          email: "email invalide",
        },
      }
    );
    await validation.run();
    const isValid = await validation.isValidate();
    const errors = await validation.getErrors();
    if (!isValid) {
      return res.status(RESPONSE_CODES.UNPROCESSABLE_ENTITY).json({
        statusCode: RESPONSE_CODES.UNPROCESSABLE_ENTITY,
        httpStatus: RESPONSE_STATUS.UNPROCESSABLE_ENTITY,
        message: "Problème de validation de données",
        result: errors,
      });
    }
    const userObject = await Utilisateurs.findOne({
      where: {
        USER_NAME: USER_NAME,
        // IS_ACTIF: 1,
        // PROFIL_ID: { [Op.notIn]: [6, 7, 16, 14, 12] },
      },
    });
    if (userObject) {
      const user = userObject.toJSON();
      const validPassword = await bcrypt.compare(
        PASSWORD,
        user.PASSWORD
      );
      if (validPassword) {
        const tokenData = {
          ID_UTILISATEUR: user.ID_UTILISATEUR,
        };
        const TOKEN = jwt.sign(tokenData, process.env.JWT_PRIVATE_KEY, {
          expiresIn: APP_ACCESS_TOKEN_MAX_AGE,
        });
        // saving notification token and refresh token
        const {...other } = user;
        res.status(RESPONSE_CODES.CREATED).json({
          statusCode: RESPONSE_CODES.CREATED,
          httpStatus: RESPONSE_STATUS.CREATED,
          message: 'utilisateur connecter',
          result: {
            ...other,
            TOKEN,
          },
        });
      } else {
        validation.setError("main", "Identifiants incorrects");
        const errors = await validation.getErrors();
        res.status(RESPONSE_CODES.NOT_FOUND).json({
          statusCode: RESPONSE_CODES.NOT_FOUND,
          httpStatus: RESPONSE_STATUS.NOT_FOUND,
          message: "Identifiants incorrects",
          result: errors,
        });
      }
    } else {
      validation.setError("main", "Identifiants incorrects");
      const errors = await validation.getErrors();
      res.status(RESPONSE_CODES.NOT_FOUND).json({
        statusCode: RESPONSE_CODES.NOT_FOUND,
        httpStatus: RESPONSE_STATUS.NOT_FOUND,
        message: "Utilisateur n'existe pas",
        result: errors,
      });
    }
  } catch (error) {
    console.log(error);
    res.status(RESPONSE_CODES.INTERNAL_SERVER_ERROR).json({
      statusCode: RESPONSE_CODES.INTERNAL_SERVER_ERROR,
      httpStatus: RESPONSE_STATUS.INTERNAL_SERVER_ERROR,
      message:error.message || "Erreur interne du serveur, réessayer plus tard",
    });
  }
};
/**
 * Permet de vérifier la déconnexion d'un utilisateur
 * @author deco257 <derick@mediabox.bi>
 * @param {express.Request} res
 * @param {express.Response} res
 */

module.exports = {
  login,
  // logout
};
