const tree = document.getElementById('tree');
const lab = document.getElementById('lab');
const menu = document.getElementById('context_menu');
let item, itemGroup, rootGroup, selInd;

window.addEventListener('load', function () {
    fetch(
        './kit_list',
        {
            method: 'POST',
        })
        .then(response => response.json())
        .then(data => {
            tree.dataSource = data
        });

    tree.addEventListener('contextmenu', function (event) {
        const target = event.target;
        item = target.closest('smart-tree-item');
        itemGroup = target.closest('smart-tree-items-group');
        rootGroup = itemGroup.parentNode.closest('smart-tree-items-group');

        if (!item && !itemGroup) {
            return;
        }

        tree.select((item || itemGroup).id);

        //Prevent default context menu
        event.preventDefault();
        const menuItems = menu.items;
        for (let i in menuItems) {
            const menuItem = menuItems[i];
            if (menuItem.value === 'change_quantity' && item) {
                menuItem.disabled = false;
            } else {
                menuItem.disabled = true;
            }
            if (menuItem.value === 'remove_item') {
                menuItem.disabled = false;
            }
        }

        menu.open(event.pageX, event.pageY);
    });


    menu.addEventListener('itemClick', function (event) {
        const eventDetail = event.detail, methodName = eventDetail.value;
        switch (methodName) {
            case 'change_quantity':
                const newItem = document.createElement('smart-tree-item');
                newItem.label = 'New item';
                tree[methodName](newItem, methodName === 'addTo' ? itemGroup : (item || itemGroup));
                break;
            case 'remove_item':
                del_tree_item_2();
                tree['removeItem'](item || itemGroup);
                break;
        }
    });


});

tree.addEventListener('change', function (event) {
    const detail = event.detail,
        item = detail.item,
        oldSelectedIndexes = detail.oldSelectedIndexes,
        selectedIndexes = detail.selectedIndexes[0];
    lab.innerHTML = selectedIndexes;
    selInd = String(selectedIndexes).split('.');
    // console.log(selInd);


})

function del_tree_item_2() {
    const level = selInd.length;
    let ds = tree.dataSource;

    function del_1_level() {
        const selInd2 = selInd[0]===0 ? 0 : selInd[0]-1;
        ds.splice(selInd[0], 1);
        tree.dataSource = ds;
        return selInd2;
    }

    function del_2_level() {
        const selInd2 = selInd[0];
        ds[selInd[0]].items.splice(selInd[1], 1);
        tree.dataSource = ds;
        return selInd2;
    }

    function del_3_level() {
        const selInd2 = selInd[0] + '.' + selInd[1];
        ds[selInd[0]].items[selInd[1]].items.splice(selInd[2], 1);
        tree.dataSource = ds;
        return selInd2;
    }

    if (level === 1) {
        tree.select(del_1_level());
    }
    if (level === 2) {
        tree.select(del_2_level());
        if (!ds[selInd[0]].items) {
            del_1_level()
        }
    }
    if (level === 3) {
        const deleted_item = del_3_level();
        tree.select('0.2.1');
        console.log('deleted' + deleted_item);
        if (!ds[selInd[0]].items[selInd[1]].items.length) {
            console.log(100);
            tree.select(del_2_level());
            if (!ds[selInd[0]].items.length) {
                tree.select(del_3_level());
            }
        }
    }
}


function del_tree_item() {
    let sub_equip_id = item ? item.value : null;
    let package_id = itemGroup ? itemGroup.value : null;
    let parent_id = rootGroup ? rootGroup.value : null;

    let level, final_id;

    if (sub_equip_id) {
        level = 3;
        final_id = sub_equip_id;
    } else if (parent_id) {
        level = 2;
        final_id = parent_id;
    } else {
        level = 1;
        final_id = package_id;
    }

    fetch(
        './del_kit_item',
        {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({"id": final_id, 'level': level})
        })
        .then(response => response.json())
        .then(data => {
            alert(110);
        });
}