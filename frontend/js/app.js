(function () {
    'use strict';

    var state = {
        users: [],
        session: null,
        services: [],
        nextServiceId: 1
    };

    var EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    function $(id) {
        return document.getElementById(id);
    }

    function setFeedback(el, message, type) {
        el.textContent = message || '';
        el.className = 'form-feedback';
        if (type) {
            el.classList.add(type);
        }
    }

    function showView(view) {
        document.querySelectorAll('.app-view').forEach(function (section) {
            section.classList.remove('is-visible');
        });
        $('view-' + view).classList.add('is-visible');
        updateNavActive(view);
    }

    function updateNavActive(view) {
        document.querySelectorAll('[data-go]').forEach(function (link) {
            link.classList.remove('active');
            if (link.getAttribute('data-go') === view) {
                link.classList.add('active');
            }
        });
    }

    function updateAuthUI() {
        var navAuth = $('nav-auth');
        var navApp = $('nav-app');
        if (state.session) {
            navAuth.classList.add('d-none');
            navApp.classList.remove('d-none');
            $('welcome-user').textContent = 'Hola, ' + state.session.displayName;
            renderSessionInfo();
        } else {
            navAuth.classList.remove('d-none');
            navApp.classList.add('d-none');
        }
    }

    function renderSessionInfo() {
        var info = $('session-info');
        if (!state.session) {
            info.innerHTML = '';
            return;
        }
        info.innerHTML =
            '<li><strong>Rol:</strong> ' + state.session.role + '</li>' +
            '<li><strong>Nombre:</strong> ' + state.session.displayName + '</li>' +
            '<li><strong>Identificador:</strong> ' + state.session.identifier + '</li>';
    }

    function bindNavigation() {
        document.querySelectorAll('[data-go]').forEach(function (link) {
            link.addEventListener('click', function (event) {
                event.preventDefault();
                var view = link.getAttribute('data-go');
                if ((view === 'dashboard' || view === 'services') && !state.session) {
                    showView('login');
                    return;
                }
                showView(view);
            });
        });
    }

    function bindRegister() {
        $('form-register').addEventListener('submit', function (event) {
            event.preventDefault();
            var name = $('reg-name').value.trim();
            var email = $('reg-email').value.trim();
            var phone = $('reg-phone').value.trim();
            var password = $('reg-password').value;
            var feedback = $('register-feedback');

            if (!name || !email || !phone || !password) {
                setFeedback(feedback, 'Todos los campos son obligatorios.', 'error');
                return;
            }
            if (!EMAIL_REGEX.test(email)) {
                setFeedback(feedback, 'Formato de correo inválido.', 'error');
                return;
            }
            if (!/^\d{10}$/.test(phone)) {
                setFeedback(feedback, 'El celular debe tener 10 dígitos.', 'error');
                return;
            }
            if (password.length < 4) {
                setFeedback(feedback, 'La contraseña debe tener mínimo 4 caracteres.', 'error');
                return;
            }
            if (state.users.some(function (u) { return u.phone === phone; })) {
                setFeedback(feedback, 'Ya existe un usuario con ese celular.', 'error');
                return;
            }

            state.users.push({
                name: name,
                email: email,
                phone: phone,
                password: password,
                role: 'client'
            });
            setFeedback(feedback, 'Registro creado. Ahora puedes iniciar sesión.', 'success');
            $('form-register').reset();
            showView('login');
        });
    }

    function loginAsAdmin(identifier, password) {
        return identifier.toLowerCase() === 'admin' && password === 'Sencho524**';
    }

    function bindLogin() {
        $('form-login').addEventListener('submit', function (event) {
            event.preventDefault();
            var identifier = $('login-identifier').value.trim();
            var password = $('login-password').value;
            var feedback = $('login-feedback');

            if (!identifier || !password) {
                setFeedback(feedback, 'Debes completar todos los campos.', 'error');
                return;
            }

            if (loginAsAdmin(identifier, password)) {
                state.session = {
                    role: 'admin',
                    displayName: 'admin',
                    identifier: 'admin'
                };
                setFeedback(feedback, 'Login exitoso.', 'success');
                updateAuthUI();
                showView('dashboard');
                return;
            }

            var user = state.users.find(function (u) {
                return u.phone === identifier && u.password === password;
            });
            if (!user) {
                setFeedback(feedback, 'Usuario/celular o contraseña incorrectos.', 'error');
                return;
            }

            state.session = {
                role: 'cliente',
                displayName: user.name,
                identifier: user.phone
            };
            setFeedback(feedback, 'Login exitoso.', 'success');
            updateAuthUI();
            showView('dashboard');
        });
    }

    function bindLogout() {
        $('btn-logout').addEventListener('click', function (event) {
            event.preventDefault();
            state.session = null;
            updateAuthUI();
            showView('home');
        });
    }

    function renderServices() {
        var list = $('services-list');
        var count = $('service-count');
        count.textContent = String(state.services.length);
        if (state.services.length === 0) {
            list.innerHTML = '<p class="text-muted mb-0">No hay servicios registrados en el frontend.</p>';
            return;
        }
        list.innerHTML = state.services.map(function (service) {
            return (
                '<article class="service-item">' +
                '<h3 class="service-item__title">' + service.name + '</h3>' +
                '<p class="service-item__meta"><strong>Variante:</strong> ' + service.variant + '</p>' +
                '<p class="service-item__meta"><strong>Precio:</strong> $' + Number(service.price).toLocaleString('es-CO') + '</p>' +
                '<p class="service-item__meta mb-0">' + service.description + '</p>' +
                '<div class="service-item__actions">' +
                '<button class="btn btn-sm btn-outline-primary" data-edit="' + service.id + '">Editar</button>' +
                '<button class="btn btn-sm btn-outline-danger" data-delete="' + service.id + '">Eliminar</button>' +
                '</div>' +
                '</article>'
            );
        }).join('');
    }

    function bindServiceForm() {
        $('form-service').addEventListener('submit', function (event) {
            event.preventDefault();
            var id = $('service-id').value;
            var name = $('service-name').value.trim();
            var variant = $('service-variant').value.trim();
            var price = $('service-price').value.trim();
            var description = $('service-description').value.trim();
            var feedback = $('service-feedback');

            if (!name || !variant || !price || !description) {
                setFeedback(feedback, 'Todos los campos son obligatorios.', 'error');
                return;
            }
            if (Number(price) < 0) {
                setFeedback(feedback, 'El precio no puede ser negativo.', 'error');
                return;
            }

            if (id) {
                var target = state.services.find(function (s) { return String(s.id) === id; });
                target.name = name;
                target.variant = variant;
                target.price = Number(price);
                target.description = description;
                setFeedback(feedback, 'Servicio actualizado.', 'success');
            } else {
                state.services.push({
                    id: state.nextServiceId++,
                    name: name,
                    variant: variant,
                    price: Number(price),
                    description: description
                });
                setFeedback(feedback, 'Servicio creado.', 'success');
            }
            $('form-service').reset();
            $('service-id').value = '';
            renderServices();
        });

        $('services-list').addEventListener('click', function (event) {
            var editId = event.target.getAttribute('data-edit');
            var deleteId = event.target.getAttribute('data-delete');
            if (editId) {
                var service = state.services.find(function (s) { return String(s.id) === editId; });
                $('service-id').value = String(service.id);
                $('service-name').value = service.name;
                $('service-variant').value = service.variant;
                $('service-price').value = String(service.price);
                $('service-description').value = service.description;
                showView('services');
            } else if (deleteId) {
                state.services = state.services.filter(function (s) { return String(s.id) !== deleteId; });
                renderServices();
            }
        });
    }

    function seedData() {
        state.users.push({
            name: 'Cliente Demo',
            email: 'cliente@demo.com',
            phone: '3178735151',
            password: '1234',
            role: 'client'
        });
        state.services = [
            { id: state.nextServiceId++, name: 'Basico', variant: 'Bajo c.c.', price: 18000, description: 'Shampoo PH neutro y restaurador de llantas.' },
            { id: state.nextServiceId++, name: 'Deluxe', variant: 'Alto c.c.', price: 70000, description: 'Servicio completo premium con diamantizado.' }
        ];
    }

    function init() {
        seedData();
        bindNavigation();
        bindRegister();
        bindLogin();
        bindLogout();
        bindServiceForm();
        updateAuthUI();
        renderServices();
        showView('home');
    }

    init();
})();
