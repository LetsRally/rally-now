import {ThemeableBrowserOptions} from "@ionic-native/themeable-browser";

export const virginZipCodes = [
    '00801',
    '00802',
    '00803',
    '00804',
    '00805',
    '00820',
    '00821',
    '00822',
    '00823',
    '00824',
    '00830',
    '00831',
    '00840',
    '00841',
    '00850',
    '00851'
];

export const themeAbleOptions: ThemeableBrowserOptions = {
    zoom: 'no',
    toolbarposition: 'top',
    location: 'yes',
    transitionstyle: 'coververtical',
    statusbar: {
        color: '#f4512c'
    },
    toolbar: {
        height: 44,
        color: '#f4512c'
    },
    title: {
        color: 'transparent',
        showPageTitle: false
    },
    closeButton: {
        wwwImage: 'assets/img/done.png',
        wwwImagePressed: 'assets/img/done_pressed.png',
        wwwImageDensity: 1,
        align: 'left',
        event: 'closePressed'
    },
    backButton: {
        wwwImage: 'assets/img/arr_left.png',
        wwwImagePressed: 'assets/img/arr_left_inactive.png',
        wwwImageDensity: 1,
        align: 'right',
        event: 'backPressed'
    },
    forwardButton: {
        wwwImage: 'assets/img/arr_right.png',
        wwwImagePressed: 'assets/img/arr_right_inactive.png',
        wwwImageDensity: 1,
        align: 'right',
        event: 'forwardPressed'
    }
};