const R = require('ramda');
const Type = require('union-type');
const h = require('snabbdom/h');

// model

const init = () => ({email: '', firstname: '', lastname: ''})
const preventDeafult = e => {e.preventDefault(); return e;}

// update

const Action = Type({
  Submit: [Object]
});
const update = Action.caseOn({
  Submit: e => {
    let {email, firstname, lastname} = e.target.elements;
    let data = {email: email.value,
        firstname: firstname.value,
        lastname: lastname.value};
    return {data, context: [email, firstname, lastname]};
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
			  value: value },
        value: value}),
    h(`i.icon${icoName}`) ]
      )])

const view = ( {submit$},
		[{email="", firstname="", lastname=""} = {},
		{emailError = "", firstnameError = "", lastnameError = ""} = {}]
	) =>  h("div.ui.segment", [
    h("dib.ui.horizontal.divider", "ADD CONTACT"),
    h("form.ui.form",
      {on: {submit: R.compose(submit$, Action.Submit, preventDeafult)}, key:"11111"},
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


export default { view, init, update, Action }
