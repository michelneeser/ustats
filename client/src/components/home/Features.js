import React from 'react';

class Features extends React.Component {
  render() {
    return (
      <div>
        <div className="row mt-3">
          <div className="col-md-4 mt-4">
            <div className="card shadow">
              <div class="card-header">Feature 1</div>
              <div class="card-body">
                <div class="card-text">Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Sapien pellentesque habitant morbi tristique.</div>
                <button type="button" className="btn btn-outline-dark btn-sm mt-3">Show example</button>
              </div>
            </div>
          </div>
          <div className="col-md-4 mt-4">
            <div className="card shadow">
              <div class="card-header">Feature 2</div>
              <div class="card-body">
                <div class="card-text">Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Sapien pellentesque habitant morbi tristique.</div>
                <button type="button" className="btn btn-outline-dark btn-sm mt-3">Show example</button>
              </div>
            </div>
          </div>
          <div className="col-md-4 mt-4">
            <div className="card shadow">
              <div class="card-header">Feature 3</div>
              <div class="card-body">
                <div class="card-text">Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Sapien pellentesque habitant morbi tristique.</div>
                <button type="button" className="btn btn-outline-dark btn-sm mt-3">Show example</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default Features;