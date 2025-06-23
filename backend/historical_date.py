import re


class HistoricalDate: 
    def __init__(self, raw_date: str | int):
        self.raw = str(raw_date).strip() # raw data before parsing
        self.year = None 
        self.percision = "" # how percise the parsed data is (exact, circa, century)
    
    def parse(self): 

        text = self.raw.lower()

        if "bc" in text or "bce" in text: # handle bc cases 
            if "century" in text: # handle bc cases with century 
                match = re.search(r"(\d+)(st|nd|rd|th)? century", text)
                if match: 
                    century = int(match.group(1))
                    self.year = -(century - 1 ) * 100 
                    self.percision = "century"
            else: 
                match = re.search(r"(\d+)", text) # search for digits
                if match: 
                    self.year = -int(match.group(1)) # convert digits to year (negative for bc)
                    self.precision = "circa" if "circa" in text or "ca" in text or "c." in text else "exact"
      
        elif "century" in text: # handles century: ex: 19th century 
            match = re.search(r"(\d+)(st|nd|rd|th)? century", text)
            if match: 
                century = int(match.group(1))
                self.year = (century - 1 ) * 100 
                self.percision = "century"

        elif "circa" in text or "ca" in text or "c." in text: # handles circa dates that are not bc 
            match = re.search(r"(\d{1,4})", text) 
            if match: 
                self.year = int(match.group(1))
                self.percision = "circa"
        else: # for all other cases, finds instance of any 1-4 numbers and saves as year: ex: 1527
            match = re.match(r"\d{1,4}", text)
            self.year = match.group(1)
            self.percision = "exact"
    
    def get_year(self): 
        return self.year 

    def get_precision(self): 
        return self.precision 



    