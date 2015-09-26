const R = require('ramda');
const Type = require('union-type');
const h = require('snabbdom/h');

// model

const init = _ => ({email: "key@key.com", firstname: "key", lastname: "key", _id: "test_id1106306"})

// update

const Action = Type({
  Edit: [Object]
});

const update = Action.caseOn({
  Edit: (newAdr, model) => R.merge(model, newAdr)
});

// view

const view = ({edit$, remove$}, item, disabled = "") => h(`tr.${item._id}${disabled}`,{props: {key: item._id}}, [
       h("td",`${item.firstname}`),
       h("td",`${item.lastname}`),
       h("td",`${item.email}`),
       h("td.center.aligned",[
           h(`i.edit.icon.large.link`, {
             on: {click: edit$}
           })
         ]),
       h("td.center.aligned",[
           h(`i.remove.user.large.icon.link`, {
             on: {click: remove$}
           })
         ])
     ])

export default { view, init, update, Action }
