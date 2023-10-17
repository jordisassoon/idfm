import './App.css';
import Network from './network';

function App() {
  return (
    <div className="App">
      <div className='column-aligned'>
        <h1>Network of the Paris Metro</h1>
        <div className='network'>
          <Network></Network>
        </div>
        <div className='row-aligned'>
          <div className='column-aligned'>
            <h1>Map</h1>
            <h3>--insert map</h3>
          </div>
          <div className='column-aligned'>
            <h1>Stats</h1>
            <h3>--insert stats</h3>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
