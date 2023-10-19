import './App.css';
import Network from './network';
import Map from './map';


function App() {
  return (
    <div className="App">
      <div className='column-aligned'>
        <h1>Network of the Paris Metro</h1>
        <div className='network'>
          <Network></Network>
        </div>
        <div className='row-aligned'>
          <div className='column-aligned' id ="map">
            <h1> HeatMap</h1>
            <p>Heatmap of Ile de France based on the number of stations per arrondissement</p>
            <Map/>
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
