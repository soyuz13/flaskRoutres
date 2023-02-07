window.addEventListener('load', function () {
    const export_project = document.getElementById('export_project');
    const new_project_window = document.getElementById('new_project_window');
    const new_project_menu_button = document.getElementById('new_project_menu_button');
    const new_project_ok_button = document.getElementById('new_project_ok');
    const new_project_cancel_button = document.getElementById('new_project_cancel');
    const project_name_input = document.getElementById('project_name');
    const project_customer_input = document.getElementById('project_customer');
    const delete_project_menu_button = document.getElementById('delete_project_menu_button');
    const recent_projects_list = document.getElementsByClassName('recent_projects');

    function new_project_window_close() {
        project_name_input.value = "";
        project_customer_input.value = "";
    };

    function load_project(event) {
        // alert(this.value);
        fetch(
            './',
            {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({"project_id": this.value})
            }).then(location.reload(true));
    };

    export_project.addEventListener('click', () => {
        grid.exportData('xlsx');
    });

    new_project_menu_button.addEventListener('click', () => {
        new_project_window.open();
    });

    new_project_ok_button.addEventListener('click', () => {
        fetch(
            './new_project',
            {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({"name": project_name_input.value, 'customer': project_customer_input.value})
            })
            .then(new_project_window.close())
    });

    new_project_cancel_button.addEventListener('click', () => {
        new_project_window.close();
    });

    new_project_window.addEventListener('close', () => {
        new_project_window_close();
    });

    new_project_window.addEventListener('open', () => {
        project_name_input.focus();
    });

    Array.from(recent_projects_list).forEach(function (element) {
        element.addEventListener('click', load_project);
    })

});