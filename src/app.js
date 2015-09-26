const R = require('ramda');
const flyd = require('flyd');
const forwardTo = require('flyd/module/forwardto');
const Type = require('union-type');
const patch = require('snabbdom').init([
  require('snabbdom/modules/class'),
  require('snabbdom/modules/props'),
  require('snabbdom/modules/eventlisteners'),
  require('snabbdom/modules/style'),
]);
const h = require('snabbdom/h');
const cuid = require('cuid');
const filterInput = require('./filterInput');
const adressForm = require('./adressForm');
const tableRow = require('./tableRow');
const { isFormValidBool,
  isFormWrongBool,
  makeErrorObject,
  safeJSONParse,
  mergeWithDefault,
  findAnyMatchingString } = require('./helpers');

// Model {list: [adresses], filter: String, editing: Array, error: Object }

const init = ( storeName = 'adress-book' ) => {
  var initial =  localStorage.getItem(storeName);
  let getAdr = R.compose( mergeWithDefault, safeJSONParse );
  return getAdr(initial);
}

const sync = (model, storeName = 'adress-book') => {
  let data = JSON.stringify({list: model.list});
  localStorage.setItem(storeName, data);
  return model;
}

// Update

const Action = Type({
  Add: [Object],
  Remove: [String],
  StartEditing: [String, Object],
  Modify: [String, Object],
  Filter: [filterInput.Action],
  Errorify: [Array]
});

const update = Action.caseOn({
  Filter: (action, model) => ({...model, filter: filterInput.update(action, model)}),
  StartEditing: (id, adr, model) => ({...model, error: [], editing: [id, adr]}),
  Remove: (id, model) => sync( R.evolve({list: R.reject((c) => c._id === id)}, model) ),
  Add: (newAdr, model) => sync( R.evolve({
      list: R.append( R.assoc("_id", cuid(), newAdr) ),
      editing:R.drop(2),
      error:R.drop(2)
    }, model) ),
  Modify: (id, newData, model) => sync( R.evolve({
    list: R.map( tr => (tr._id === id ?
      tableRow.update(tableRow.Action.Edit(newData), tr) : tr) ),
    editing:R.drop(2),
    error:R.drop(2)}, model) ),
  Errorify: (errorData, model) => ({...model, error: errorData})
});

const SubAction = Type({
  SubmitForm: [adressForm.Action]
});
const subUpdate =  SubAction.caseOn({
  SubmitForm: (action, model) => {
    let data = adressForm.update(action, model);
    return isFormWrongBool(data) ? Action.Errorify([data, makeErrorObject(data)]) :
      model.editing.length === 0 ? Action.Add(data) : Action.Modify(model.editing[0], data)
  }
});

// View

const view = R.curry((actions$, model) => {
  let editing = model.editing[0] || null;
  let error = model.error[0] || null;
  let filter = filterInput.view({filter$: forwardTo(actions$, Action.Filter)});
  let mainForm = adressForm.view({
    submit$: forwardTo(actions$, R.compose( R.flip(subUpdate)(model), SubAction.SubmitForm ))
  }, error ?  model.error : editing ? R.takeLast(1, model.editing) : []);
  let table = model.list.filter( findAnyMatchingString(model.filter) )
    .map( adr => tableRow.view({
      edit$: forwardTo(actions$, R.always(Action.StartEditing(adr._id, adr))),
      remove$: forwardTo(actions$, R.always(Action.Remove(adr._id)))
    }, adr, editing &&  editing === adr._id ? ".disabled" : "") );
  return h("div.ui.grid.container",[
    h("div.ui.grid.row",[
        h("div.five.wide.column", [
            filter,
            mainForm
          ]),
        h("div.eleven.wide.column", [
            h("h2.ui.center.aligned.icon.header", [ h("i.users.icon"), "Adress Book" ]),
            h("table.ui.basic.selectable.single.line.table",
              [h("thead", [ h("tr", [
                  h("th", "First Name"),
                  h("th", "Last Name"),
                  h("th", "Email"),
                  h("th.center.aligned", "Edit"),
                  h("th.center.aligned", "Delete")
                ]) ]),
                h("tbody", [].concat(table))
              ])])
          ])
      ]);
});

// Stream$

const actions$ = flyd.stream();
const model$ = flyd.scan(R.flip(update), init(), actions$);
const vnode$ = flyd.map(view(actions$), model$);
//flyd.map((model) => console.log(model), model$);

window.addEventListener('DOMContentLoaded', function() {
  const container = document.getElementById('app');
  flyd.scan(patch, container, vnode$);
});
