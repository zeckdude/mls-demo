import React, { Component } from 'react';
import { connect } from 'react-redux';
import { HashRouter, Route, Switch } from 'react-router-dom';
import { get as _get, isEmpty as _isEmpty, map as _map, pickBy as _pickBy } from 'lodash';
import Spinner from './Spinner';
import NavBarOffCanvas from './NavBarOffCanvas';
import NavBar from './NavBar';
import SearchMap from '../containers/SearchMap';
import SearchFilters from '../containers/SearchFilters';
import SearchResults from '../containers/SearchResults';
import Modal from '../containers/Modal';
import ListingDetailPage from '../containers/ListingDetailPage';
import { fetchListings } from '../actions';
import { createQueryStringFromArray } from '../helpers';


class App extends Component {
  constructor(props) {
    super(props);
    this.updateListings = this.updateListings.bind(this);
  }
  /**
   * Internal event to run after any state property (that this component is using) has been updated and the component has been re-rendered
   * @return void
   */
  componentDidUpdate(prevProps) {
    // console.log('_get(this.props, "SearchFiltersForm.initial")', _get(this.props, 'SearchFiltersForm.initial'));
    // console.log('_get(this.props.SearchFiltersForm, "initial")', _get(this.props.SearchFiltersForm, 'initial'));
    // console.log('_get(prevProps, "SearchFiltersForm.initial")', _get(prevProps, 'SearchFiltersForm.initial'));
    // Fetch the new listings if the map viewing area or selected search area points get changed
    // Make sure that the props are actually updated, since componentDidUpdate will also run when the component is mounted
    if (
      prevProps.map.points !== this.props.map.points ||
      prevProps.selectedSearchArea.points !== this.props.selectedSearchArea.points ||
      prevProps.SearchFiltersForm.initial !== _get(this.props, 'SearchFiltersForm.initial')
    ) {
      this.updateListings();
    }
  }

  /**
   * Determine whether the map's viewing area or the selected search area should be used to provide the approprate latitude/longitude sets
   * @return {[type]} An array of objects for each point with its latitude and longitude coordinates
   */
  getSearchLatLngSets() {
    // If a search area is not selected with the search shapes tools, then use the map's viewing area coordinates
    if (_isEmpty(this.props.selectedSearchArea.points)) {
      return this.props.map.points;
    }

    // Otherwise use the selected search area's coordinates
    return this.props.selectedSearchArea.points;
  }

  /**
   * Create query string and fetch new listings
   * @return void
   */
  updateListings() {
    // Build query string that specifies the latitude/longitude sets within the selected search area
    const searchPointsArray = this.createPointsArray(this.getSearchLatLngSets());
    // Get search values and remove any properties that are empty strings (this occurs when a field is touched and then nothing is entered according to redux-form functionality)
    const searchParameters = _pickBy(this.props.SearchFiltersForm.values, (val, key) => val !== '');
    // Create the querystring to include with the AJAX call to the endpoint
    const searchQueryString = createQueryStringFromArray([...searchPointsArray, searchParameters]);
    // Call the action creator to fetch the listings
    this.props.fetchListings(`?${searchQueryString}`);
  }

  /**
   * Re-map the array so that the latitude/longitude properties are the combined value for a `points` key
   * @param  {object[]} latLngSets - An array of objects for each point with its latitude and longitude coordinates
   * @example <caption>Example usage of createPointsArray.</caption>
   * const latLngSets = [
   *   { lat: 29.969211659636688, lng: -96.21826171875001 },
   *   { lat: 29.969211659636688, lng: -94.48104858398439 },
   *   { lat: 29.470687864832556, lng: -96.21826171875001 },
   *   { lat: 29.470687864832556, lng: -94.48104858398439 }
   * ]
   * App.createPointsArray(latLngSets);
   * // returns:
   * [
   *   { points: "29.969211659636688,-96.21826171875001" },
   *   { points: "29.969211659636688,-94.48104858398439" },
   *   { points: "29.470687864832556,-96.21826171875001" },
   *   { points: "29.470687864832556,-94.48104858398439" }
   * ]
   * @return {array} - List of all points
   */
  createPointsArray(latLngSets) {
    return _map(latLngSets, (latLngSet) => {
      const { lat, lng } = latLngSet;
      return { points: `${lat},${lng}` };
    });
  }

  render() {
    return (
      <HashRouter>
        <div>
          <Spinner />
          <NavBarOffCanvas />

          <div id="page-container">
            <NavBar />
            <main>
              <Switch>
                <Route exact path="/listings/:mlsId" component={ListingDetailPage} />
                <Route
                  exact path="/" render={() => (
                    <div>
                      <SearchMap />
                      <section id="lower-container" className="uk-container uk-padding uk-padding-remove-top uk-remove-padding@m">
                        <SearchFilters />
                        <SearchResults />
                      </section>
                    </div>
                )}
                />
              </Switch>
            </main>
          </div>

          {/* <Route path="/listings/:listingId" component={Modal} /> */}

        </div>
      </HashRouter>
    );
  }
}

/**
 * mapStateToProps which gives the component access to the redux store
 * @return {object} - Mapping of state properties (in the redux store) to prop properties that will be available within the component
 */
// const mapStateToProps = state => ({
//   map: state.map,
//   selectedSearchArea: state.selectedSearchArea,
//   SearchFiltersForm: state.form.SearchFiltersForm,
// });
//
const mapStateToProps = state =>
  // console.log('state in App.js:', state);
  // console.log('loadingStatus in App.js:', state.listings.loadingStatus);
  ({
    map: state.map,
    selectedSearchArea: state.selectedSearchArea,
    SearchFiltersForm: state.form.SearchFiltersForm,
    modal: state.modal,
  });
export default connect(mapStateToProps, {
  fetchListings,
})(App);
