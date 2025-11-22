package com.fixitnow.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.Optional;

@Service
public class GeocodingService {

    @Value("${security.maps.apiKey:}")
    private String apiKey;

    private final RestTemplate rest = new RestTemplate();
    private final ObjectMapper mapper = new ObjectMapper();

    /**
     * Geocode an address using Google Geocoding API. Returns Optional of [lat, lng]
     */
    public Optional<double[]> geocode(String address) {
        if (address == null || address.isBlank() || apiKey == null || apiKey.isBlank()) return Optional.empty();
        try {
            String url = "https://maps.googleapis.com/maps/api/geocode/json?address=" + URLEncoder.encode(address, StandardCharsets.UTF_8) + "&key=" + apiKey;
            String resp = rest.getForObject(url, String.class);
            JsonNode root = mapper.readTree(resp);
            if (root.has("status") && "OK".equals(root.get("status").asText())) {
                JsonNode results = root.get("results");
                if (results != null && results.isArray() && results.size() > 0) {
                    JsonNode loc = results.get(0).get("geometry").get("location");
                    double lat = loc.get("lat").asDouble();
                    double lng = loc.get("lng").asDouble();
                    return Optional.of(new double[]{lat, lng});
                }
            }
        } catch (Exception e) {
            // swallow and return empty — caller can log
        }
        return Optional.empty();
    }
}
