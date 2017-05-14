module.exports = {
    menu_default: [{
        title: 'Home',
        type: 'head',
        href: '/'
    }],
    menu_user: [{
        title: 'Profile',
        type: 'sub',
        menus: [{
            title: 'Bot Dashboard',
            href: '/bot'
        },{
            title: 'Slack configuration',
            href: '/slack_configuration'
        },{
            title: 'See profile',
            href: '/profile'
        },{
            title: 'Edit profile',
            href: '/profile/edit'
        }]
    }],
    menu_login: [{
        title: 'Login',
        type: 'head',
        href: '/login'
    }],
    menu_admin: [{
        title: 'Settings',
        type: 'sub',
        menus: [{
            title: 'Users',
            href: '/settings/users'
        },{
            title: 'Invite user',
            href: '/settings/invite'
        }]
    }],
    contact:[{
        title: 'Contact',
        type: 'head',
        href: '/contact'
    }],
    logout:[{
        title: 'Logout',
        type: 'head',
        href: '/logout'
    }]
}