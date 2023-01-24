const combobox1 = document.querySelector('smart-combo-box');
// const label = document.getElementById('mmm')
const combobox2 = document.getElementById('c2');
const listbox = document.querySelector('smart-list-box');

combobox1.filterMode = 'containsIgnoreCase';
combobox2.filterMode = 'containsIgnoreCase';
listbox.filterMode = 'containsIgnoreCase';


combobox1.addEventListener('close', function (event) {
	let selectedValues = combobox1.selectedValues;
    // label.innerHTML = selectedValues;

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






