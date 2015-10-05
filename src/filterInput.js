const R = require('ramda');
const Type = require('union-type');
const h = require('snabbdom/h');
const grabText = e => e.target.value ;
const checkLength =  str => str.length > 2 ? str : "" ;

// model

const init = _ => ''

// update

const Action = Type({
  Input: [Object]
});
const update = Action.caseOn({
  Input: R.compose( checkLength, grabText )
});

// view

const view = ({filter$}) =>
  h("div.ui.segment", [
    h("div.ui.horizontal.divider", "SEARCH CONTACT"),
    h("div.ui.icon.input.fluid", [
      h(`input`, {
        props: {placeholder: "Search", type: "text"},
        on: {input: R.compose( filter$, Action.Input)}
      }),
      h("i.search.icon")
      ])
    ])

export default { view, init, update, Action }
