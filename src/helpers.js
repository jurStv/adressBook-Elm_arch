import R from "ramda";
import { Success, Failure } from "data.validation";

function isNameValid(label = "", name){
  return /^[\d\w]+$/.test(name) ?
           Success(name)
  :
           Failure([ [label, ".error"] ])
}

function isEmailValid(email){
  return /^\S+@\S+\.\S+/.test(email) ?
           Success(email)
  :
           Failure([ ["emailError", ".error"] ])
}

function isFormValid( {firstname, lastname, email} ){
  return Success( R.curry( (fname,lname,email) => [fname,lname,email] ) )
            .ap(isNameValid( "firstnameError", firstname ))
            .ap(isNameValid( "lastnameError", lastname ))
            .ap(isEmailValid( email ))
}

function isFormValidBool( form ){
  return isFormValid( form ).isSuccess;
}

function isFormWrongBool( form ){
  return isFormValid( form ).isFailure;
}

function makeErrorObject( form ){
  var formChecked = isFormValid( form );
  return formChecked.isFailure ? R.fromPairs( formChecked.merge() ) : {};
}

////////////////

function deepFreeze(o) {
  var prop, propKey;
  Object.freeze(o);
  for (propKey in o) {
    prop = o[propKey];
    if (!o.hasOwnProperty(propKey) || !(typeof prop === 'object') || Object.isFrozen(prop)) {
      continue;
    }
    deepFreeze(prop);
  }
  return o;
}

const addDefaultUniq = (defItem, key, items) => {
  return  ( R.containsWith( (a,b) => {return a[key] === b[key]}, defItem, items  ) )
  ?
    items
  :
    R.append(defItem, items);
}

const safeJSONParse = str => JSON.parse(str) || {list:[]};
const mergeWithDefault = adresses => {
  let defaultAdresses = [{email: "key@key.com", firstname: "key", lastname: "key", _id: "test_id1106306"}];
  return {list: addDefaultUniq( defaultAdresses[0], "_id", adresses.list ), filter: '', editing: [], error: []}
}

const findAnyMatchingString = (str) => R.compose( R.any( R.test( RegExp(str) ) ), R.values )

export default {
  isFormValidBool,
  isFormWrongBool,
  makeErrorObject,
  deepFreeze,
  safeJSONParse,
  mergeWithDefault,
  findAnyMatchingString
}
