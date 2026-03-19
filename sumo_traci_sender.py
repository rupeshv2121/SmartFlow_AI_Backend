import os
import sys

import requests  # type: ignore[import-not-found]


# Add SUMO tools path
if "SUMO_HOME" in os.environ:
    tools = os.path.join(os.environ["SUMO_HOME"], "tools")
    if tools not in sys.path:
        sys.path.append(tools)
else:
    sys.exit("Please declare environment variable 'SUMO_HOME'")

import traci  # type: ignore  # noqa: E402

VEHICLES_ENDPOINT = os.environ.get("VEHICLES_ENDPOINT", "http://localhost:3000/api/vehicles")


sumo_cmd = [
    "sumo-gui",
    "-c",
    r"C:\Users\hp\Sumo\2026-03-18-09-47-36\osm.sumocfg",
]

traci.start(sumo_cmd)

try:
    for step in range(1000):
        traci.simulationStep()

        # Send data every 10 steps instead of every step (reduces load by 90%)
        if step % 10 == 0:
            # Get all vehicle IDs but only send first 50 to reduce payload
            all_vehicle_ids = traci.vehicle.getIDList()
            total_vehicles = len(all_vehicle_ids)
            vehicles_to_send = all_vehicle_ids[:50]

            vehicles_payload = []
            for vehicle_id in vehicles_to_send:
                x_pos, y_pos = traci.vehicle.getPosition(vehicle_id)
                try:
                    # TraCI returns (longitude, latitude) for convertGeo.
                    lon, lat = traci.simulation.convertGeo(x_pos, y_pos)
                    vehicles_payload.append(
                        {
                            "id": vehicle_id,
                            "lat": lat,
                            "lng": lon,
                            "x": x_pos,
                            "y": y_pos,
                        }
                    )
                except traci.exceptions.TraCIException:
                    # Fallback keeps the feed alive even if geo projection is unavailable.
                    vehicles_payload.append({"id": vehicle_id, "x": x_pos, "y": y_pos})

            lights_payload = []
            tls_ids = traci.trafficlight.getIDList()
            for tls_id in tls_ids:
                state = traci.trafficlight.getRedYellowGreenState(tls_id)

                try:
                    tls_x, tls_y = traci.junction.getPosition(tls_id)
                    lon, lat = traci.simulation.convertGeo(tls_x, tls_y)
                    lights_payload.append(
                        {
                            "id": tls_id,
                            "state": state,
                            "lat": lat,
                            "lng": lon,
                        }
                    )
                except traci.exceptions.TraCIException:
                    # Some SUMO networks have no direct junction position for tls ids.
                    continue

            # Send optimized payload: total count + limited vehicle data
            payload = {
                "total": total_vehicles,  # Total vehicles in simulation
                "count": len(vehicles_payload),  # Vehicles being sent
                "vehicles": vehicles_payload,  # Limited vehicle positions
                "lights": lights_payload,
            }

            print(
                f"Step {step}: Total: {total_vehicles}, "
                f"Sending: {len(vehicles_payload)}, Lights: {len(lights_payload)}"
            )

            try:
                response = requests.post(VEHICLES_ENDPOINT, json=payload, timeout=5)
                response.raise_for_status()
            except requests.RequestException as exc:
                print(f"Step {step}: failed to send vehicle data: {exc}")
finally:
    traci.close()
