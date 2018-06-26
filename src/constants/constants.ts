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
        wwwImage: 'assets/img/done_x.png',
        wwwImagePressed: 'assets/img/done_x_touched.png',
        wwwImageDensity: 4,
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

export const appStoreUrl = 'http://appstore.com';

export const feedbackRows = [
    {
        id: 1,
        text: 'Spoke with a staffer!'
    },
    {
        id: 2,
        text: 'Left message'
    },
    {
        id: 3,
        text: 'Line busy'
    },
    {
        id: 4,
        text: 'Voicemail full'
    },
    {
        id: 5,
        text: 'Wrong Number'
    },
    {
        id: 6,
        text: 'Other'
    }
];

export const feedbackSignRows = [
    {
        id: 1,
        text: 'Signed petition'
    },
    {
        id: 2,
        text: 'Page failed to load'
    },
    {
        id: 3,
        text: 'I\'ll sign later'
    },
    {
        id: 4,
        text: 'Other'
    }
];

export const feedbackDonateRows = [
    {
        id: 1,
        text: 'I donated'
    },
    {
        id: 2,
        text: 'Page failed to load'
    },
    {
        id: 3,
        text: 'I\'ll donate later'
    },
    {
        id: 4,
        text: 'Other'
    }
];

export const feedbackFaxRows = [
    {
        id: 1,
        text: 'I faxed'
    },
    {
        id: 2,
        text: 'Page failed to load'
    },
    {
        id: 3,
        text: 'I\'ll fax later'
    },
    {
        id: 4,
        text: 'Other'
    }
];

export const feedbackEmailRows = [
    {
        id: 1,
        text: 'I emailed'
    },
    {
        id: 2,
        text: 'Page failed to load'
    },
    {
        id: 3,
        text: 'I\'ll email later'
    },
    {
        id: 4,
        text: 'Other'
    }
];