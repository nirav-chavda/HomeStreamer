(function () {
    let add_btn = document.querySelector('.add-btn');
    let reload_btn = document.querySelector('.reload-btn');
    $(add_btn).on('click', function () {
        getPath();
    });
    $(reload_btn).on('click', function () {
        listContent();
    });
    listContent();
})()

function dirClicked(ele) {
    listContent($(ele).data('id'));
}

function getPath() {
    swal({
            text: 'Add full path here',
            content: 'input',
            closeOnClickOutside: false,
            button: {
                text: 'Add',
                closeModal: false,
            },
        })
        .then(path => {
            if (!path) throw null;
            return makeRequest('/add', {
                path
            })
        })
        .then(results => {
            return results.json();
        })
        .then(json => {
            if (!json.success) {
                swal(json.message);
            } else {
                getName(json.path, json.name);
            }
        })
        .catch(err => {
            swal('Something went wrong');
        });
}

function getName(path, defaultName) {
    swal({
            text: 'Add Name Here',
            content: {
                element: 'input',
                attributes: {
                    value: defaultName
                }
            },
            button: {
                text: 'Save',
                closeModal: false,
            },
            closeOnClickOutside: false,
        })
        .then(name => {
            name = (!name) ? defaultName : name;
            return makeRequest('/make', {
                path,
                name
            })
        })
        .then(results => {
            return results.json();
        })
        .then(json => {
            swal(json.message);
            listContent();
        })
        .catch(err => {
            swal('Something went wrong');
        });
}

function makeRequest(path, body) {
    return fetch(path, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(body)
    });
}

function listContent(dirname = null) {
    const url = (dirname != null) ? '/list?dir=' + dirname : '/list';
    $.get(url, (res) => {
        let data = '';
        let dirData = '';
        res.list.forEach(file => {
            if (file.type === 'dir') {
                dirData += '<li class="dir"><a onclick="dirClicked(this)" class="clickable" data-id="' + file.value + '">' + file.name;
                if (file.isBack) {
                    dirData += '&nbsp;&nbsp;<i class="fa fa-level-up" aria-hidden="true"></i>';
                }
                dirData += '</a></li>';
            } else {
                data += '<li><a href="/watch/' + file.value + '" target="_blank" class="clickable">' + file.name + '</a></li>';
            }
        });
        data = dirData + data;
        $('.content').html((data === '') ? 'No Files Available' : data);
    });
}