import React, { Component } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { map as _map } from 'lodash';
import UIkit from 'uikit';
import SingleResult from '../components/SingleResult';

class SearchResults extends Component {
  componentDidUpdate() {
    UIkit.grid('#search-results-grid');
  }

  /**
   * Render a single listing
   * @return {ReactElement} - Markup of single listing
   */
  renderSingleResults() {
    return _map(this.props.listings, (listing) => {
      const {
        listingId,
        listPrice,
        address: { streetNumber, streetName },
        property: {
          area, bedrooms, garageSpaces, bathsFull,
        },
      } = listing;

      return (
        <SingleResult
          key={listingId}
          featuredPhoto={listing.photos[0]}
          streetNumber={streetNumber}
          streetName={streetName}
          area={area}
          bedrooms={bedrooms}
          garageSpaces={garageSpaces}
          bathsFull={bathsFull}
          listPrice={listPrice}
          listingId={listingId}
        />
      );
    });
  }

  renderSearchResults() {
    if (Object.keys(this.props.listings).length > 0) {
      return (
        <div id="search-results-grid" className="uk-child-width-1-2@s uk-child-width-1-3@m uk-grid uk-grid-match" data-uk-grid>
          {this.renderSingleResults()}
        </div>
      );
    }

    return (
      <div id="search-results-not-found-container"><p>There was no results found with the provided filters and/or in the marked search area. Please broaden your search to view listings.</p></div>
    );
  }

  render() {
    return (
      <div id="search-results-panel" className="mobile-panel">
        <div className="uk-padding-small">
          <div className="uk-heading-divider uk-flex uk-flex-top uk-margin-bottom">
            <h3 className="uk-flex-1 uk-margin-remove-bottom">
              Search Results (<span className="results-num">{Object.keys(this.props.listings).length}</span>)
            </h3>
            <button className="uk-hidden uk-button uk-button-primary uk-button-small clear-search-parameters-btn">Clear Filters</button>
          </div>
          {this.renderSearchResults()}
        </div>
      </div>
    );
  }
}

/**
 * mapStateToProps which gives the component access to the redux store
 * @return {object} - Mapping of state properties (in the redux store) to prop properties that will be available within the component
 */
const mapStateToProps = state => ({
  listings: state.listings,
});

export default connect(mapStateToProps, null)(SearchResults);

SearchResults.propTypes = {
  listings: PropTypes.objectOf(PropTypes.object).isRequired,
};