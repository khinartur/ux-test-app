import * as React from 'react'
import { render } from 'react-dom'
import { BrowserRouter } from 'react-router-dom'
import App from './components/App'

import * as AppStyles from './styles/App.scss';

import {createMuiTheme, MuiThemeProvider} from '@material-ui/core/styles';

const theme = createMuiTheme({
    palette: {
        primary: {
            light: '#000000',
            main: '#000000',
            dark: '#000000',
        },
        secondary: {
            light: '#00695f',
            main: '#009688',
            dark: '#33ab9f',
        },
        error: {
            light: '#b2102f',
            main: '#ff1744',
            dark: '#ff4569',
        },
    } as any,
});

render(
    <MuiThemeProvider theme={theme}>
        <BrowserRouter>
            <App/>
        </BrowserRouter>
    </MuiThemeProvider>,
    document.getElementById("reactContainer")
);
