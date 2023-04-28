const tableGameUsersid = '#tableGameUsers';
const tempPagingButtonId = "paging_button_";
const urlPlayersRoot = '/rest/players';
const btnPageClass = "table__btn_type_page";

const raceValues = ['HUMAN', 'DWARF', 'ELF', 'GIANT', 'ORC', 'TROLL', 'HOBBIT'];
const professionValues = ['WARRIOR', 'ROGUE', 'SORCERER', 'CLERIC', 'PALADIN', 'NAZGUL', 'WARLOCK', 'DRUID'];
const bannedValues = ['true', 'false']
const sections = {
    race: raceValues,
    profession: professionValues,
    banned: bannedValues
}

function onloadWindow() {
    showTable();
    // renderOptionals();
};

// function renderOptionals() {
//
//     document.querySelectorAll('select').forEach(select => {
//         let selectName = select.name;
//         console.log(selectName);
//         if (selectName) {
//             let values = Array.from(Object.keys(sections)).find(select.name);
//             console.log(values);
//             values.forEach((value) => {
//                 select.append(getOptional(value));
//             })
//         }
//     });
// }

function showTable(pageNumber) {
    $("tr:has(td)").remove();

    pageNumber = (pageNumber != null) ? pageNumber : 0;

    let countPerPage = $("#pageSize").val();

    let url = `${urlPlayersRoot}?pageSize=${countPerPage}&pageNumber=${pageNumber}`;

    $.get(url, function (data) {
        $.each(data, function (i, item) {
            $('<tr>').html(`
                <td>${item.id}</td>
                <td>${item.name}</td>
                <td>${item.title}</td>
                <td>${item.race}</td>
                <td>${item.profession}</td>
                <td>${item.level}</td>
                <td>${new Date(item.birthday).toLocaleDateString()}</td>
                <td>${item.banned}</td><td>`
                + '<button id = "button_edit_' + item.id + '" onclick=" + editRow(' + item.id + ')">'
                + '<img src = "/img/edit.png"></button></td><td>'
                + '<button id = "button_delete_' + item.id + '" onclick="deleteRow(' + item.id + ')">'
                + '<img src = "/img/delete.png"></button></td><td>'
            ).appendTo(tableGameUsersid)
        });
    })

    let totalCount = getTotalAccount();
    let pagesCount = Math.ceil(totalCount / countPerPage);

    $(`button.${btnPageClass}`).remove();

    for (let i = 0; i < pagesCount; i++) {
        $("#pagingButtons")
            .append(
                $(`<button id="${tempPagingButtonId + i}" class="${btnPageClass}">${i + 1}</button>`)
                    .attr("onclick", `showTable(${i})`)
            );
    }

    $(`#${tempPagingButtonId + pageNumber}`)
        .addClass(`${btnPageClass}_active`);
}

function getTotalAccount() {
    let url = `${urlPlayersRoot}/count`;
    let res = 0;
    $.ajax({
        url: url,
        async: false,
        success: function (result) {
            res = parseInt(result);
        }
    })
    return res;
}

function deleteRow(id) {
    let url = `${urlPlayersRoot}/${id}`;
    $.ajax({
        url: url,
        type: 'DELETE',
        success: () => {
            showTable(getCurrentPage());
        }
    })
}


function editRow(id) {
    let btnEditId = `#button_edit_${id}`;
    let btnDeleteId = `#button_delete_${id}`;
    $(btnDeleteId).remove();
    let saveImageTag = '<img src = "/img/save.png">';
    $(btnEditId).html(saveImageTag);

    let currentRow = $(btnEditId).parent().parent();
    let cells = currentRow.children();

    let cellName = cells[1];
    cellName.innerHTML =
        `<input id="input_name_${id}" type="text" value="${cellName.innerHTML}">`;

    let cellTitle = cells[2];
    cellTitle.innerHTML =
        `<input id="input_title_${id}"type="text" value="${cellTitle.innerHTML}">`;

    let cellRace = cells[3];
    let raceId = `#select_race_${id}`;
    renderEditSelect(cellRace, raceId, 'race', raceValues);

    let cellProfession = cells[4];
    let professionId = `#select_profession_${id}`;
    renderEditSelect(cellProfession, professionId, 'profession', professionValues);

    let cellBanned = cells[7];
    let bannedId = `#select_banned_${id}`;
    renderEditSelect(cellBanned, bannedId, 'banned', bannedValues);

    let propertySaveTag = "patch(" + id + ")";
    $(btnEditId).attr("onclick", propertySaveTag);
}

function create() {
    let value_name = $("#inputNameNew").val();
    let value_title = $("#inputTitleNew").val();
    let value_race = $("#inputRaceNew").val();
    let value_profession = $("#inputProfessionNew").val();
    let value_level = $("#inputLevelNew").val();
    let value_birthday = $("#inputBirthdayNew").val();
    let value_banned = $("#inputBannedNew").val();


    let url = urlPlayersRoot;

    $.ajax({
        url: url,
        type: 'POST',
        dataType: 'json',
        contentType: 'application/json;charset=UTF-8',
        async: false,
        data: JSON.stringify({
            "name": value_name,
            "title": value_title,
            "race": value_race,
            "profession": value_profession,
            "level": value_level,
            "birthday": new Date(value_birthday).getTime(), // преобразование даты в long
            "banned": value_banned
        }),
        success: function () {
            $("#inputNameNew").val("");
            $("#inputTitleNew").val("");
            $("#selectRaceNew").val("");
            $("#selectProfessionNew").val("");
            $("#selectLevelNew").val("");
            $("#selectBirthdayNew").val("");
            $("#inputBannedNew").val("");
            showTable(getCurrentPage());
        }
    });

}

function patch(id) {
    let valueName = $("#input_name_" + id).val();
    let valueTitle = $("#input_title_" + id).val();
    let valueRace = $("#select_race_" + id).val();
    let valueProfession = $("#select_profession_" + id).val();
    let valueBanned = $("#select_banned_" + id).val();
debugger

    let url = urlPlayersRoot + id;
    $.ajax({
        url: url,
        type: 'POST', // тип запроса
        dataType: 'json',
        contentType: 'application/json; charset = UTF-8',
        async: false,
        data: JSON.stringify({
            "name": valueName,
            "title": valueTitle,
            "race": valueRace,
            "proffession": valueProfession,
            "banned": valueBanned
        }),
        success: function () {
            showTable(getCurrentPage());
        }
    });

}

function renderEditSelect(cell, id, labelName, values) {
    let currentValue = cell.innerHTML;
    cell.innerHTML = getHtmlFellEditSelect(id, labelName, currentValue, values);
    $(id).val(currentValue);
}

function getOptional(currentValue, defaultValue, previousValue) {
    return defaultValue != null && currentValue === defaultValue
        ? `${previousValue + '\n'}<option selected value="${currentValue}">${currentValue}</option>`
        : `${previousValue + '\n'}<option value="${currentValue}">${currentValue}</option>`
}

function getHtmlFellEditSelect(id, labelName, defaultValue, values) {
    return `<label for="${labelName}" ></label>
    <select id="${id}" name="${labelName}">
    ${values.reduce((previousValue, currentValue) => {
        return getOptional(currentValue, defaultValue, previousValue);
    }, '')}
    </select>`
}

function getCurrentPage() {
    return parseInt($(`.${btnPageClass}_active`).text()) - 1;
}
