(function () {
    window.currentDir = null;
    let home_btn = document.querySelector('.home-btn');
    let add_btn = document.querySelector('.add-file');
    let reload_btn = document.querySelector('.reload-btn');
    let add_dir_btn = document.querySelector('.add-dir');
    let add_dir_files_btn = document.querySelector('.add-dir-files');
    $(home_btn).on('click', function () {
        window.location = '/';
    });
    $(add_btn).on('click', function () {
        getPath();
    });
    $(add_dir_btn).on('click', function () {
        addDirectory();
    });
    $(add_dir_files_btn).on('click', function () {
        addDirectoryWithFiles();
    });
    $(reload_btn).on('click', function () {
        loadContentFromDir();
    });
    $(document).on('click', '.trash-btn', function (event) {
        deleteItem($(this).closest('li').find('a:first').data('id'));
    })
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

function addDirectoryWithFiles() {
    const path = window.currentDir;

    swal({
            text: 'Add Folder Path',
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
            return makeRequest('/dir/upload', {
                path,
                name
            })
        })
        .then(results => {
            return results.json();
        })
        .then(json => {
            let swalData = {
                timer: 3000
            };
            if (!json.success) {
                swalData.text = json.message;
            } else {
                swalData.title = json.message.replace('added!', '');
                swalData.text = 'Added!';
            }
            swal(swalData);
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

function deleteItem(path) {
    if (path === '') {
        swal('Something went wrong');
        return;
    }
    swal({
            title: 'Are you sure?',
            buttons: true,
            dangerMode: true,
            closeOnClickOutside: false,
            closeOnEsc: false
        })
        .then(res => {
            if (!res) {
                throw "";
            }
            return makeRequest('/delete', {
                path
            })
        })
        .then(results => {
            return results.json();
        })
        .then(json => {
            if (json.success) {
                swal(json.message, {
                    icon: 'success',
                    timer: 3000
                });
                listContent();
            } else {
                swal(json.message, {
                    timer: 3000
                });
            }
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
                dirData += '<li class="dir">';
                dirData += '<div><a onclick="dirClicked(this)" class="clickable left" data-id="' + file.value + '">' + file.name;
                if (file.isBack) {
                    dirData += '&nbsp;&nbsp;<i class="fa fa-level-up" aria-hidden="true"></i></a>';
                } else {
                    dirData += '</a><a class="clickable right trash-btn"><i class="fa fa-trash" aria-hidden="true"></i></a>';
                }
                dirData += '<div style="clear: both;"></div>';
                dirData += '</div></li>';
            } else {
                data += '<li>';
                data += '<div><a href="/watch/' + file.value + '" target="_blank" class="clickable" data-id="' + file.value + '">' + file.name + '</a>';
                data += '<a class="clickable right trash-btn"><i class="fa fa-trash" aria-hidden="true"></i></a>';
                data += '<div style="clear: both;"></div>'
                data += '</div></li>';
            }
        });
        data = dirData + data;
        $('.content').html((data === '') ? 'No Files Available' : data);
    });
}