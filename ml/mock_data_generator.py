"""
Mock Data Generator for Water Quality Parameters
Generates realistic water quality data based on humidity and temperature conditions
"""

import random
from typing import Tuple
from dataclasses import dataclass

@dataclass
class WaterQualityParams:
    """Water quality parameters structure"""
    ph_value: float
    turbidity_value: float
    ammonia_nitrogen_value: float
    nitrate_nitrogen_value: float
    total_coliform_value: float
    calcium_value: float
    chloride_value: float
    fluoride_value: float
    phosphate_phosphorus_value: float
    potassium_value: float
    sodium_value: float
    sulphate_value: float
    total_alkalinity_value: float
    total_dissolved_solids_value: float
    total_hardness_value: float
    total_suspended_solids_value: float

class MockDataGenerator:
    """Generates mock water quality data based on environmental conditions"""
    
    def __init__(self):
        # Normal ranges for water quality parameters (WHO/EPA standards)
        self.normal_ranges = {
            'ph_value': (6.5, 8.5),
            'turbidity_value': (0.1, 4.0),
            'ammonia_nitrogen_value': (0.0, 0.5),
            'nitrate_nitrogen_value': (0.0, 10.0),
            'total_coliform_value': (0.0, 100.0),
            'calcium_value': (20.0, 200.0),
            'chloride_value': (10.0, 250.0),
            'fluoride_value': (0.5, 1.5),
            'phosphate_phosphorus_value': (0.0, 0.3),
            'potassium_value': (5.0, 50.0),
            'sodium_value': (10.0, 200.0),
            'sulphate_value': (10.0, 250.0),
            'total_alkalinity_value': (50.0, 300.0),
            'total_dissolved_solids_value': (100.0, 500.0),
            'total_hardness_value': (50.0, 300.0),
            'total_suspended_solids_value': (5.0, 50.0)
        }
        
        # Contaminated ranges (when conditions are bad - exceeds WHO limits)
        self.contaminated_ranges = {
            'ph_value': (4.0, 6.0),  # More acidic - causes corrosion
            'turbidity_value': (5.0, 15.0),  # Higher turbidity - bacterial growth
            'ammonia_nitrogen_value': (1.0, 5.0),  # Higher ammonia - toxic
            'nitrate_nitrogen_value': (15.0, 50.0),  # Higher nitrates - methemoglobinemia
            'total_coliform_value': (500.0, 2000.0),  # Higher coliform - fecal contamination
            'calcium_value': (300.0, 500.0),  # Higher calcium - kidney stones
            'chloride_value': (400.0, 800.0),  # Higher chlorides - bladder cancer risk
            'fluoride_value': (2.0, 4.0),  # Higher fluoride - dental fluorosis
            'phosphate_phosphorus_value': (0.5, 2.0),  # Higher phosphates - eutrophication
            'potassium_value': (100.0, 300.0),  # Higher potassium - cardiovascular issues
            'sodium_value': (300.0, 600.0),  # Higher sodium - hypertension
            'sulphate_value': (400.0, 800.0),  # Higher sulphates - gastrointestinal issues
            'total_alkalinity_value': (400.0, 800.0),  # Higher alkalinity - metabolic alkalosis
            'total_dissolved_solids_value': (800.0, 1500.0),  # Higher TDS - taste issues
            'total_hardness_value': (400.0, 800.0),  # Higher hardness - scale formation
            'total_suspended_solids_value': (100.0, 300.0)  # Higher TSS - turbidity
        }
        
        # Critical contamination ranges (extreme conditions)
        self.critical_ranges = {
            'ph_value': (2.0, 4.0),  # Extremely acidic
            'turbidity_value': (15.0, 50.0),  # Very high turbidity
            'ammonia_nitrogen_value': (5.0, 20.0),  # Extremely high ammonia
            'nitrate_nitrogen_value': (50.0, 100.0),  # Extremely high nitrates
            'total_coliform_value': (2000.0, 10000.0),  # Extremely high coliform
            'calcium_value': (500.0, 1000.0),  # Extremely high calcium
            'chloride_value': (800.0, 2000.0),  # Extremely high chlorides
            'fluoride_value': (4.0, 10.0),  # Extremely high fluoride
            'phosphate_phosphorus_value': (2.0, 10.0),  # Extremely high phosphates
            'potassium_value': (300.0, 1000.0),  # Extremely high potassium
            'sodium_value': (600.0, 2000.0),  # Extremely high sodium
            'sulphate_value': (800.0, 2000.0),  # Extremely high sulphates
            'total_alkalinity_value': (800.0, 2000.0),  # Extremely high alkalinity
            'total_dissolved_solids_value': (1500.0, 5000.0),  # Extremely high TDS
            'total_hardness_value': (800.0, 2000.0),  # Extremely high hardness
            'total_suspended_solids_value': (300.0, 1000.0)  # Extremely high TSS
        }
    
    def _get_risk_level(self, humidity: float, temperature: float) -> str:
        """Determine risk level based on environmental conditions"""
        # Critical: Both humidity and temperature are very high
        if humidity > 90.0 and temperature > 40.0:
            return "critical"
        # High risk: Either humidity or temperature is high
        elif humidity > 80.0 or temperature > 35.0:
            return "high"
        # Normal: Both are within acceptable ranges
        else:
            return "normal"
    
    def _generate_parameter_value(self, param_name: str, risk_level: str) -> float:
        """Generate a single parameter value based on risk level"""
        if risk_level == "critical":
            ranges = self.critical_ranges
        elif risk_level == "high":
            ranges = self.contaminated_ranges
        else:
            ranges = self.normal_ranges
            
        min_val, max_val = ranges[param_name]
        
        # Add some randomness with bias towards contamination for higher risk levels
        if risk_level == "critical":
            # Bias towards extreme contamination values
            base_value = random.uniform(min_val, max_val)
            contamination_factor = random.uniform(1.2, 2.0)
            return min(base_value * contamination_factor, max_val)
        elif risk_level == "high":
            # Bias towards higher contamination values
            base_value = random.uniform(min_val, max_val)
            contamination_factor = random.uniform(1.0, 1.5)
            return min(base_value * contamination_factor, max_val)
        else:
            # Normal conditions - use standard random distribution
            return random.uniform(min_val, max_val)
    
    def generate_water_quality_data(self, humidity: float, temperature: float) -> WaterQualityParams:
        """Generate water quality parameters based on environmental conditions"""
        risk_level = self._get_risk_level(humidity, temperature)
        
        params = {}
        for param_name in self.normal_ranges.keys():
            params[param_name] = self._generate_parameter_value(param_name, risk_level)
        
        return WaterQualityParams(**params)
    
    def get_condition_summary(self, humidity: float, temperature: float) -> Tuple[bool, str]:
        """Get a summary of the environmental conditions"""
        risk_level = self._get_risk_level(humidity, temperature)
        
        if risk_level == "critical":
            reasons = []
            if humidity > 90.0:
                reasons.append(f"Extreme humidity ({humidity:.1f}%)")
            if temperature > 40.0:
                reasons.append(f"Extreme temperature ({temperature:.1f}°C)")
            reason = f"CRITICAL contamination risk: {', '.join(reasons)}"
            is_contaminated = True
        elif risk_level == "high":
            reasons = []
            if humidity > 80.0:
                reasons.append(f"High humidity ({humidity:.1f}%)")
            if temperature > 35.0:
                reasons.append(f"High temperature ({temperature:.1f}°C)")
            reason = f"Contamination risk detected: {', '.join(reasons)}"
            is_contaminated = True
        else:
            reason = f"Normal conditions: Humidity {humidity:.1f}%, Temperature {temperature:.1f}°C"
            is_contaminated = False
        
        return is_contaminated, reason

# Example usage and testing
if __name__ == "__main__":
    generator = MockDataGenerator()
    
    # Test with critical risk conditions
    print("=== CRITICAL Risk Conditions ===")
    critical_humidity, critical_temp = 95.0, 42.0
    critical_data = generator.generate_water_quality_data(critical_humidity, critical_temp)
    is_critical, reason = generator.get_condition_summary(critical_humidity, critical_temp)
    print(f"Conditions: {reason}")
    print(f"pH: {critical_data.ph_value:.2f}")
    print(f"Turbidity: {critical_data.turbidity_value:.2f}")
    print(f"Ammonia: {critical_data.ammonia_nitrogen_value:.2f}")
    print(f"Nitrate: {critical_data.nitrate_nitrogen_value:.2f}")
    print(f"Coliform: {critical_data.total_coliform_value:.2f}")
    
    # Test with high risk conditions
    print("\n=== HIGH Risk Conditions ===")
    high_humidity, high_temp = 85.0, 38.0
    contaminated_data = generator.generate_water_quality_data(high_humidity, high_temp)
    is_contaminated, reason = generator.get_condition_summary(high_humidity, high_temp)
    print(f"Conditions: {reason}")
    print(f"pH: {contaminated_data.ph_value:.2f}")
    print(f"Turbidity: {contaminated_data.turbidity_value:.2f}")
    print(f"Ammonia: {contaminated_data.ammonia_nitrogen_value:.2f}")
    print(f"Nitrate: {contaminated_data.nitrate_nitrogen_value:.2f}")
    print(f"Coliform: {contaminated_data.total_coliform_value:.2f}")
    
    print("\n=== Normal Conditions ===")
    normal_humidity, normal_temp = 60.0, 25.0
    normal_data = generator.generate_water_quality_data(normal_humidity, normal_temp)
    is_normal, reason = generator.get_condition_summary(normal_humidity, normal_temp)
    print(f"Conditions: {reason}")
    print(f"pH: {normal_data.ph_value:.2f}")
    print(f"Turbidity: {normal_data.turbidity_value:.2f}")
    print(f"Ammonia: {normal_data.ammonia_nitrogen_value:.2f}")
    print(f"Nitrate: {normal_data.nitrate_nitrogen_value:.2f}")
    print(f"Coliform: {normal_data.total_coliform_value:.2f}")
