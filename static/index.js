const combobox = document.querySelector('smart-combo-box');
// const label = document.getElementById('mmm')

const combobox2 = document.getElementById('c2');

combobox.filterMode = 'containsIgnoreCase';
combobox2.filterMode = 'containsIgnoreCase';
const listbox = document.querySelector('smart-list-box');

combobox.addEventListener('close', function (event) {
	let selectedValues = combobox.selectedValues;
    // label.innerHTML = selectedValues;
    // alert(selectedValues);

    // const url = {{ url_for("combo2", num = s)|tojson }};
    fetch(
        'http://127.0.0.1:5000/extend/' + selectedValues,
        {
        method: 'post'
        // body: 'num='+selectedValues
      })

    .then(response => response.json())
    .then(data => {

        // alert(data);
        // data is a parsed JSON object



        combobox2.dataSource = data;
        listbox.dataSource = data;

    });

})






