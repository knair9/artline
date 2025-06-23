"""
    Authors: Harper Noteboom and Kalyani Nair
    Date:   6/19/2025

    Artifact class to represent each single art object
"""
from historical_date import HistoricalDate

class Artifact:

    def __init__(self, name, raw_date, description, location, artist, source): 
        self.name = name
        self.raw_date = raw_date 
        self.hist_date = HistoricalDate(raw_date)
        self.tl_year = self.hist_date.get_year()
        self.description = description 
        self.location = location 
        self.artist = artist 
        self.source = source 
    
    def get_name(self):
        return self.name 
    
    def get_raw_date(self): 
        return self.raw_date

    def get_tl_year(self):
        return self.tl_year
    
    def get_precision(self): 
        return self.hist_date.get_precision()

    def get_description(self):
        return self.description
    
    def get_location(self): 
        return self.location 

    def get_artist(self):
        return self.artist

    def get_source(self): 
        return self.source
  
    