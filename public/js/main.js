(function () {
    window.currentDir = null;
    let home_btn = document.querySelector('.home-btn');
    let add_btn = document.querySelector('.add-file');
    let reload_btn = document.querySelector('.reload-btn');
    let add_dir_btn = document.querySelector('.add-dir');
    $(home_btn).on('click', function () {
        window.location = '/';
    });
    $(add_btn).on('click', function () {
        getPath();
    });
    $(add_dir_btn).on('click', function () {
        addDirectory();
    });
    $(reload_btn).on('click', function () {
        loadContentFromDir();
    });
    listContent();
})()

function loadContentFromDir(dirname = null) {
    if (dirname != null) {
        window.currentDir = dirname;
    }
    listContent();
}

function dirClicked(ele) {
    loadContentFromDir($(ele).data('id'));
}

function addDirectory() {
    const path = window.currentDir;

    swal({
            text: 'Folder Name',
            content: {
                element: 'input',
            },
            button: {
                text: 'Add',
                closeModal: false,
            },
            closeOnClickOutside: false,
        })
        .then(name => {
            if (name === null || name === undefined || name.trim() === '') {
                throw "";
            }
            return makeRequest('/dir/add', {
                path,
                name
            })
        })
        .then(results => {
            return results.json();
        })
        .then(json => {
            swal({
                title: json.message.replace('added!', ''),
                text: 'Added!',
                timer: 3000
            });
            loadContentFromDir(json.dir);
        })
        .catch(err => {
            if (typeof err === 'string' && err == '') {
                return;
            }
            swal('Something went wrong');
        });
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
            if (path === null || path === undefined || path.trim() === '') {
                throw "";
            }
            return makeRequest('/add', {
                path
            })
        })
        .then(results => {
            return results.json();
        })
        .then(json => {
            if (!json.success) {
                swal(json.message, {
                    timer: 3000
                });
            } else {
                getName(json.path, json.name);
            }
        })
        .catch(err => {
            if (typeof err === 'string' && err == '') {
                return;
            }
            swal('Something went wrong');
        });
}

function getName(dir, defaultName) {
    const path = window.currentDir;
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
                name,
                dir
            })
        })
        .then(results => {
            return results.json();
        })
        .then(json => {
            swal(json.message, {
                timer: 3000
            });
            listContent();
        })
        .catch(err => {
            if (typeof err === 'string' && err == '') {
                return;
            }
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

function listContent() {
    const dirname = window.currentDir;
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