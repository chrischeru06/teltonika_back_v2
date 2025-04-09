const { query } = require("../utils/db")
const moment = require("moment")

class Validation {
   constructor(data, validation, customMessages) {
      this.data = data
      this.validation = validation
      this.customMessages = customMessages
      this.errors = {}
   }
   /**
    * Check if passed data are valid
    *
    * @returns Boolean
    */
   async isValidate() {
      const errors = await this.getErrors()
      return Object.keys(errors).length === 0 && errors.constructor === Object
   }

   /**
    * set new message error
    * @param {string} key - message key
    * @param {string} message - that describe the error
    * @returns {void}
    */
   async setError(key, message) {
      const errors = this.errors[key] ? [...this.errors[key], message] : [message]
      this.errors = { ...this.errors, [key]: errors }
   }
   /**
    * get message by key
    * @param {string} key - the message key you want to get
    * @returns {string}
    */
   async getError(key) {
      await this.run()
      return this.errors[key]
   }
   /**
    * mark input data as required
    * @param {string} key - the key you want to set as required
    * @param {string} value - the value
    */
   async required(key, intitialValue) {
      // eslint-disable-next-line no-useless-catch
      try {
         if (!this.validation[key] || !this.validation[key].required) return false
         const value = typeof intitialValue == "string" ? (intitialValue ? intitialValue.trim() : "") : intitialValue
         let isInvalid = false
         if (typeof value == "string" || Array.isArray(value)) {
            if (!value || value === "" || value.length === 0) {
               isInvalid = true
            }
         } else if (typeof value == "object" && !Array.isArray(value)) {
            if (!value) {
               isInvalid = true
            }
         } else if (!value) {
            isInvalid = true
         }
         if (isInvalid) {
            this.setError(key, this.customMessages?.[key]?.required || `Ce champ est obligatoire`)
         }
      } catch (error) {
         throw error
      }
   }

   async length(key, value, params) {
      if (!value) return
      const [min, max] = params
      if (min && !max && value.length < min) {
         this.setError(key, this.customMessages?.[key]?.length || `Entrez au moins ${min} caractères`)
      } else if (!min && max && value.length > max) {
         this.setError(key, this.customMessages?.[key]?.length || `Vous ne pouvez pas dépasser ${max} caractères`)
      } else if (min && max && (value.length < min || value.length > max)) {
         this.setError(
            key,
            this.customMessages?.[key]?.length || `La valeur de ce champ doit être comprise entre ${min} et ${max}`,
         )
      }
   }
   async match(key, value, params) {
      if (!value) return
      if (this.data[params] !== value) {
         this.setError(key, this.customMessages?.[key]?.match || `La valeur ne correspond pas à la ${params} valeur`)
      }
   }
   async username(key, value) {
      if (!value) return
      const validUsername = /^[a-zA-Z0-9._]+$/.test(value)
      if (!validUsername || value?.length < 2) {
         this.setError(
            key,
            this.customMessages?.[key]?.username ||
               "Nom d'utilisateur incorrect (lettres, chiffres, point ou trait de soulignement)",
         )
      }
   }
   async email(key, value) {
      if (!value) return
      const validEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
      if (!validEmail) {
         this.setError(key, this.customMessages?.[key]?.email || "Email invalid")
      }
   }

   async image(key, value, params) {
      if (!value) return
      const IMAGES_MIMES = ["image/jpeg", "image/jpg", "image/gif", "image/png"]
      if (!IMAGES_MIMES.includes(value.mimetype)) {
         this.setError(key, this.customMessages?.[key]?.image || "Veuillez choisir une image valide")
      } else if (params < value.size) {
         const megaBite = (params - 1000000) / 1000000
         this.setError(
            key,
            this.customMessages?.[key]?.size || `Votre image est trop volumineuse (max: ${megaBite} MB)`,
         )
      }
   }

   async fileTypes(key, value, params) {
      if (!value || !value?.mimetype) return
      const VALID_MIMES = params
      if (!VALID_MIMES.includes(value.mimetype)) {
         this.setError(key, this.customMessages?.[key]?.fileTypes || `Invalid file type(${params.join(", ")})`)
      }
   }

   async fileSize(key, value, params) {
      if (!value || !value?.size) return
      if (params < value.size) {
         const megaBite = (params - 1000000) / 1000000
         this.setError(key, this.customMessages?.[key]?.fileSize || `File too large (max: ${megaBite} MB)`)
      }
   }
   async exists(key, value, params) {
      // eslint-disable-next-line no-useless-catch
      try {
         if (!value) return
         const [tableName, columnName] = params.split(",")
         const row = (await query(`SELECT ${columnName} FROM ${tableName} WHERE ${columnName} = ?`, [value]))[0]
         if (!row) {
            this.setError(key, this.customMessages?.[key]?.exists || `La ligne n'existe pas sur la table ${tableName}`)
         }
      } catch (error) {
         throw error
      }
   }
   async unique(key, value, params) {
      // eslint-disable-next-line no-useless-catch
      try {
         if (!value) return
         const [tableName, columnName] = params.split(",")
         const row = (await query(`SELECT ${columnName} FROM ${tableName} WHERE ${columnName} = ?`, [value]))[0]
         if (row) {
            this.setError(
               key,
               this.customMessages?.[key]?.unique || `Le ${columnName} doit être unique sur la table ${tableName}`,
            )
         }
      } catch (error) {
         throw error
      }
   }
   alpha(key, value) {
      if (!value) return
      const pattern = /^[\w\s!"#$%&'()*+,-./:;<=>?@[\\\]^_`{|}~\u00C0-\u017F]+$/u
      let isString = pattern.test(value)
      if (!isString) {
         this.setError(
            key,
            this.customMessages?.[key]?.alpha || `This field must contains alphanumeric characters only`,
         )
      }
   }
   number(key, value) {
      if (!value) return
      let isnum = /^\d+$/.test(value)
      if (!isnum) {
         this.setError(key, this.customMessages?.[key]?.number || `This field must be a valid number`)
      }
   }
   integer(key, value) {
      if (!value) return
      let isnum = isNaN(value)
      if (isnum) {
         this.setError(key, this.customMessages?.[key]?.number || `This field must be a valid integer`)
      }
   }
   date(key, value, params) {
      if (!value) return
      const format = params
      let isDate = moment(value, format).isValid()
      if (!isDate) {
         this.setError(key, this.customMessages?.[key]?.date || `This field must be a valid date(${format})`)
      }
   }
   /**lm!
    *
    * run the valiton to check for errors
    */
   async run() {
      for (let key in this.validation) {
         const value = this.getValue(key)
         const [properties, params] = this.getProperties(this.validation[key])
         // eslint-disable-next-line no-useless-catch
         try {
            await Promise.all(
               properties.map(async (property) => {
                  await this[property](key, value, params?.[property])
               }),
            )
         } catch (error) {
            throw error
         }
      }
   }
   /**
    * get all erros
    * @returns {object | {}}
    */
   async getErrors() {
      return this.errors
   }

   getProperties(value) {
      switch (typeof value) {
         case "string":
            return [value.split(","), null]

         case "object":
            // eslint-disable-next-line no-case-declarations
            const properties = []
            for (let key in value) {
               properties.push(key)
            }
            return [properties, value]

         default:
            return [value, null]
      }
   }

   getValue(key) {
      return this.data && key ? this.data[key] : null
   }
}
module.exports = Validation
