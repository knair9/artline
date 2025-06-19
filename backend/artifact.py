"""
    Authors: Harper Noteboom and Kalyani Nair
    Date:   6/19/2025

    Artifact class to represent each single art object
"""

class Artifact:

    def __init__(self, name, date, description, location, artist, source): 
        self.name = name
        self.date = date 
        self.description = description 
        self.location = location 
        self.artist = artist 
        self.source = source 
    
    def get_name(self):
        return self.name 
    
    def get_date(self): 
        return self.date     

    def get_description(self):
        return self.description
    
    def get_location(self): 
        return self.location 

    def get_artist(self):
        return self.artist

    def get_source(self): 
        return self.source
    
    