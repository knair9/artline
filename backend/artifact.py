"""
    Authors: Harper Noteboom and Kalyani Nair
    Date:   7/3/2025

    Artifact class to represent each single art object
"""


class Artifact:
    # more documentation on each parameter can be found at https://metmuseum.github.io/#object

    def __init__(self, objectID, objectDate, beginDate, endDate, isHighlight,
                 isPublicDomain, image, image_small, other_images, department,
                 objectName, title, culture, period, medium, artist,
                 met_url):  # add more parameters as needed

        self.objectID = objectID
        self.objectDate = objectDate
        self.beginDate = beginDate
        self.endDate = endDate
        self.isHighlight = isHighlight
        self.isPublicDomain = isPublicDomain
        self.image = image
        self.image_small = image_small
        self.other_images = other_images
        self.department = department
        self.objectName = objectName
        self.title = title
        self.culture = culture
        self.period = period
        self.medium = medium
        self.artist = artist
        self.met_url = met_url

    def get_objectID(self):
        return self.objectID

    def get_objectDate(self):
        return self.objectDate

    def get_beginDate(self):
        return self.beginDate

    def get_endDate(self):
        return self.endDate

    def get_isHighlight(self):
        return self.isHighlight

    def get_isPublicDomain(self):
        return self.isPublicDomain

    def get_image(self):
        return self.image

    def get_image_small(self):
        return self.image_small

    def get_other_images(self):
        return self.other_images

    def get_department(self):
        return self.department

    def get_objectName(self):
        return self.objectName

    def get_title(self):
        return self.title

    def get_culture(self):
        return self.culture

    def get_period(self):
        return self.period

    def get_medium(self):
        return self.medium

    def get_artist(self):
        return self.artist

    def get_met_url(self):
        return self.met_url

    def __str__(self):
        return f"Artifact. id: {self.objectID} by {self.artist} ({self.objectDate})"