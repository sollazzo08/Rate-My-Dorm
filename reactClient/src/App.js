/*
Made by Nick Ventura, Michael Sollazzo and Phillip Smith
*/
import React from 'react';
import 'bootstrap/dist/css/bootstrap.min.css'
import 'bootstrap/dist/js/bootstrap.bundle.min'
import './utils/config'
import {BrowserRouter as Router, Route, Switch} from "react-router-dom";
import DebugPage from './Components/debug/debug'
import LoginModal from './Components/login/LoginModal'
import RegistrationPage from "./Components/registration/registrationPage";
import SearchPage from './Components/searchComponents/SearchPage';
import Navbar from './Components/navComponents/navigation/Navbar';
import SingleDorm from './Components/singleDorm/singleDorm';
import config from 'react-global-configuration'
import {auth, is_user_logged_in, showLoginModal} from "./utils/auth";
import AddDormForm from './Components/addDormForm/addDormForm';
import {combineReducers, createStore} from 'redux';
import {reducer as formReducer} from 'redux-form'
import {Provider} from 'react-redux';
import DashBoard from './Components/dashboard/Dash/dashboard.js';

//Returns all reducing functions as an object into the store..in our case we just have one reducing function to handle state of our addDormForm 
const reducers = combineReducers({form: formReducer});
//Redux store, this holds the complete state of our app.
//It accepts a reducing function that accepts next state tree
const store = createStore(reducers);
//console.log(store);

class App extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            showLogin: false,
            isLoggedIn: false,
            passedCoordinates: {
                lat: 42.686063,
                lng: -73.824688,
                },
            passedAddress: ''
        };

        
    }

    componentDidMount() {
        is_user_logged_in(this.setAppLoggedInState)
    }

    passedCoordFromMap = (coordFromOpenMap) => {
        this.setState({passedCoordinates: coordFromOpenMap})
    }
    
    passedAddressFromMap = (addressFromOpenMap) => {
        this.setState({passedAddress: addressFromOpenMap})
    }

    render() {
        
        return (
            
           <Provider store = {store}>
             {/*Set base route depending on if we are deployed to EC2 or local*/}
            <Router basename={config.get('subfolder')}>
                <Navbar isLoggedIn={this.state.isLoggedIn}
                        setAppLoginState={this.setAppLoggedInState}/>
                <div className="row">
                    <div className="col">
                        <LoginModal loginResultFn={this.setAppLoggedInState}/>
                    </div>
                </div>
                <Switch>
                    <RegistrationPage path="/" exact component={RegistrationPage}/>
                    <Route path='/register' component={RegistrationPage}/>
                    <Route path="/search" component={() => 
                        <SearchPage
                            coordinates = {this.passedCoordFromMap} 
                            searchAddress = {this.passedAddressFromMap}
                        />	
                    }/>
                    <Route path='/debug' component={DebugPage}/>
                    <Route path='/singleDorm/:id' component={SingleDorm}/>
                    <PrivateRoute  path='/addDormForm' component={AddDormForm}/>
                    <Route component={DashBoard}/>{/*KEEP THIS AS THE LAST ROUTE*/}
                </Switch>
            </Router>
           </Provider> 
        )
    }

    setAppLoggedInState = (isLoggedIn, init=false) => {
        console.log('login state function called with: ' + isLoggedIn);
        this.setState({isLoggedIn: isLoggedIn})
        if(init) {
            if(isLoggedIn) {
                auth.authenticate()
            }
        }
    }

}

function PrivateRoute({ component: Component, ...rest }) {
    console.log('private route ', auth.isAuthenticated)
    return (
        <Route
            {...rest}
            render={({ location }) =>
                auth.isAuthenticated ? (<Component {...rest}/>) :
                    showLoginModal()
            }
        />
    );
}

export default App;