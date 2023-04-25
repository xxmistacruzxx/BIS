import { ObjectId } from "mongodb";

const exportedMethods = {
  checkId(id, varName) {
    if (!id) throw `Error: You must provide a ${varName}`;
    if (typeof id !== "string") throw `Error:${varName} must be a string`;
    id = id.trim();
    if (id.length === 0)
      throw `Error: ${varName} cannot be an empty string or just spaces`;
    if (!ObjectId.isValid(id)) throw `Error: ${varName} invalid object ID`;
    return id;
  },

  checkString(strVal, varName) {
    if (!strVal) throw `Error: You must supply a ${varName}!`;
    if (typeof strVal !== "string") throw `Error: ${varName} must be a string!`;
    strVal = strVal.trim();
    if (strVal.length === 0)
      throw `Error: ${varName} cannot be an empty string or string with just spaces`;
    if (!isNaN(strVal))
      throw `Error: ${strVal} is not a valid value for ${varName} as it only contains digits`;
    return strVal;
  },

  checkStringArray(arr, varName) {
    if (!arr || !Array.isArray(arr))
      throw `You must provide an array of ${varName}`;
    for (let i in arr) {
      if (typeof arr[i] !== "string" || arr[i].trim().length === 0) {
        throw `One or more elements in ${varName} array is not a string or is an empty string`;
      }
      arr[i] = arr[i].trim();
    }

    return arr;
  },

  checkEmail(email, varName) {
    email = this.checkString(email, varName);
    email = email.toLowerCase();
    let atSplit = email.split("@");
    if (atSplit.length !== 2)
      throw `${varName} must have 1, and only 1, '@' character in it`;
    let dotSplit = atSplit[1].split(".");
    if (dotSplit.length < 2)
      throw `${varName} must have at least 1 '.' after the '@' character`;
    return email;
  },

  isObject(variable) {
    return Object.prototype.toString.call(variable) === "[object Object]";
  },

  checkInt(intVal, varName) {
    if (!intVal) throw `Error: You must supply a ${varName}!`;
    if (typeof intVal !== "number")
      throw `Error: ${varName} must be an integer!`;
    if (Math.trunc(intVal) !== intVal)
      throw `Error: ${varName} must be an integer`;
    return intVal;
  },

  checkNum(numVal, varName) {
    if (!numVal) throw `Error: You must supply a ${varName}`;
    if (typeof numVal !== "number") throw `Error: ${varName} must be a number`;
    return numVal;
  },

  checkPassword(password, varName) {
    password = this.checkString(password, varName);
    if (password.length < 8) throw `${varName} must be 8 characters or longer`;
    if (!password.match(/[A-Z]/)) throw `${varName} must have a capital letter`;
    if (!password.match(/[0-9]/)) throw `${varName} must have a number`;
    if (!password.match(/[\W_]/))
      throw `${varName} must have a special character`;
    return password;
  },

  checkName(name, varName) {
    name = this.checkString(name, varName);
    if (name.length < 3 || name.length > 25)
      throw `${varName} must be between 3 and 25 characters (inclusive)`;
    if (name.match(/[^a-zA-Z\-]/))
      throw `${varName} can only include letters and hyphens`;
    return name;
  },

  checkUserName(userName, varName) {
    userName = this.checkString(userName, varName);
    if (userName.length < 3 || userName.length > 25)
      throw `${varName} must be between 3 and 25 characters (inclusive)`;
    if (userName.match(/[^\w-\_]/))
      throw `${varName} can only include letters, numbers, hyphens, and underscores.`;
    return userName;
  },
};

export default exportedMethods;
