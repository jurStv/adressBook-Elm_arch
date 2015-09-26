const R = require('ramda');
const Type = require('union-type');
const h = require('snabbdom/h');
const preventDeafult = e => {e.preventDefault(); return e;}
// model

const init = () => ({email: '', firstname: '', lastname: ''})

// update

const Action = Type({
  Submit: [Object]
});
const update = Action.caseOn({
  Submit: e => {
    let {email, firstname, lastname} = e.target.elements;
    return {email: email.value,
        firstname: firstname.value,
        lastname: lastname.value}
  }
});

// view

const makeField = ( {id, placeholder, value, error,  icoName = ".user"} ) =>
  h(`div.field${error}`, [h(`div.ui.icon.input`, [
		h(`input${id}`, {
      props: {
				type: "text",
				form: "form",
				placeholder,
			  value }}),
    h(`i.icon${icoName}`) ]
      )])

const view = ( {submit$},
		[{email="", firstname="", lastname=""} = {},
		{emailError = "", firstnameError = "", lastnameError = ""} = {}]
	) => {
	return h("div.ui.segment", [
    h("dib.ui.horizontal.divider", "ADD CONTACT"),
    h("form.ui.form",
      {on: {submit: R.compose(submit$, Action.Submit, preventDeafult)}},
      [	makeField(
  					{id: "#firstname",
            placeholder: "First name",
  					error: firstnameError,
  					value: firstname}
  				),
  			makeField(
  					{id: "#lastname",
            placeholder: "Last name",
  					error: lastnameError,
  					value: lastname}
  				),
  			makeField(
  					{id: "#email",
            placeholder: "Email",
  					error: emailError,
  					icoName: ".at",
  					value: email}
  				),
			h("button.ui.basic.button.fluid", {props: {type: "submit"}}, [
				h("i.add.user.icon"),
				"  Save"
				])
			])
    ])
}

export default { view, init, update, Action }
