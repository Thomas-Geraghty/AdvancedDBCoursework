import L from "leaflet";
import "leaflet-routing-machine";

export function createLine(waypoints, color) {
  var router = L.Routing.osrmv1({ serviceUrl: 'http://127.0.0.1:5000/route/v1' });

  var route1waypoints = waypoints.map(waypoint => {
    return L.Routing.waypoint(L.latLng(waypoint[0], waypoint[1]));
  })

  return new Promise((resolve) => {
    router.route(route1waypoints, function (error, routes) {
      resolve(L.Routing.line(routes[0], {styles: [{color: color}]})._route.coordinates);
    }, null, {});
  })
}