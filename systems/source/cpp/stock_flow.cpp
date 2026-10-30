// C++17 FEFO allocator. Reads a synthetic manifest; never mutates inventory.
#include <algorithm>
#include <fstream>
#include <iostream>
#include <regex>
#include <set>
#include <sstream>
#include <stdexcept>
#include <string>
#include <vector>

struct Lot { std::string id, expiry; int quantity; };
bool dateValid(const std::string& value) {
    if (!std::regex_match(value, std::regex(R"(\d{4}-\d{2}-\d{2})"))) return false;
    int year = std::stoi(value.substr(0,4)), month = std::stoi(value.substr(5,2)), day = std::stoi(value.substr(8,2));
    if (year < 1 || month < 1 || month > 12) return false;
    int days[] = {31,28,31,30,31,30,31,31,30,31,30,31};
    if (year % 400 == 0 || (year % 4 == 0 && year % 100 != 0)) days[1] = 29;
    return day >= 1 && day <= days[month-1];
}
int main(int argc, char** argv) {
    try {
        if (argc != 4) throw std::runtime_error("Usage: stock_flow lots.csv YYYY-MM-DD demand");
        std::string today = argv[2], requested = argv[3];
        if (!dateValid(today) || !std::regex_match(requested,std::regex(R"(\d{1,7})"))) throw std::runtime_error("Invalid date or demand");
        int remaining = std::stoi(requested);
        if (remaining < 1 || remaining > 1000000) throw std::runtime_error("Demand must be 1..1000000");
        std::ifstream input(argv[1]);
        if (!input) throw std::runtime_error("Cannot open manifest");
        std::vector<Lot> lots; std::set<std::string> ids; std::string line;
        while (std::getline(input, line)) {
            if (!line.empty() && line.back() == '\r') line.pop_back();
            if (line.empty()) continue;
            std::istringstream row(line); std::string id, expiry, quantity, extra;
            if (!std::getline(row,id,',') || !std::getline(row,expiry,',') || !std::getline(row,quantity,',') || std::getline(row,extra,',')) throw std::runtime_error("Expected batch_id,expiry,quantity without a header");
            if (!std::regex_match(id,std::regex(R"([A-Za-z0-9_-]{1,40})")) || !ids.insert(id).second || !dateValid(expiry) || !std::regex_match(quantity,std::regex(R"(\d{1,7})"))) throw std::runtime_error("Invalid or duplicate manifest row");
            int count=std::stoi(quantity);
            if (count>1000000 || lots.size()>=500) throw std::runtime_error("Manifest limit exceeded");
            lots.push_back({id,expiry,count});
        }
        if (lots.empty()) throw std::runtime_error("Empty manifest");
        std::sort(lots.begin(),lots.end(),[](const Lot& a,const Lot& b){return a.expiry==b.expiry?a.id<b.id:a.expiry<b.expiry;});
        std::cout << "batch_id,expiry,allocated,balance,status\n";
        for (const auto& lot:lots) {
            if (lot.expiry<=today) { std::cout<<lot.id<<','<<lot.expiry<<",0,"<<lot.quantity<<",excluded\n"; continue; }
            int allocated=std::min(remaining,lot.quantity); remaining-=allocated;
            std::cout<<lot.id<<','<<lot.expiry<<','<<allocated<<','<<lot.quantity-allocated<<",eligible\n";
        }
        std::cerr << "Shortage: " << remaining << '\n';
        return 0;
    } catch (const std::exception& error) { std::cerr<<"Error: "<<error.what()<<'\n'; return 1; }
}
