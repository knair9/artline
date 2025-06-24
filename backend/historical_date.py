import re


class HistoricalDate: 
    def __init__(self, raw_date: str | int):
        self.raw = str(raw_date).strip() # raw data before parsing
        self.year =  "No Year"
        self.precision = "" # how percise the parsed data is (exact, circa, century)
        self.parse()
    
    def parse(self): 
        
        text = self.raw.lower()

        if "bc" in text or "bce" in text: # handle bc cases 
            if "century" in text: # handle bc cases with century 
                match = re.search(r"(\d+)(st|nd|rd|th)? century", text)
                if match: 
                    century = int(match.group(1))
                    self.year = -(century - 1 ) * 100 
                    self.precision = "century"
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
                self.precision = "century"

        elif "circa" in text or "ca" in text or "c." in text: # handles circa dates that are not bc 
            match = re.search(r"(\d{1,4})", text) 
            if match: 
                self.year = int(match.group(1))
                self.precision = "circa"
        else: # for all other cases, finds instance of any 1-4 numbers and saves as year: ex: 1527
            match = re.search(r"(\d{1,4})", text)
            if match:
                self.year = int(match.group(1))
                self.precision = "exact"
            self.precision = "exact"
            
    def get_year(self): 
        return self.year 

    def get_precision(self): 
        return self.precision 

    def get_raw(self):
        return self.raw

    def __str__(self):
        return f"Raw Date: {self.raw}, Year: {self.year}, Precision:{self.precision}"
    
    
    

test = HistoricalDate("1754")  
print(test.get_year())
print(test.get_precision())
print(test)

