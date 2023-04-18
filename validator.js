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
};

export default exportedMethods;
