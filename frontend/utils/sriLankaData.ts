export interface SriLankaProvince {
  name: string;
  districts: {
    name: string;
    towns: { name: string; postalCode: string }[];
  }[];
}

export const SRI_LANKA_REGIONS: SriLankaProvince[] = [
  {
    name: 'Western Province',
    districts: [
      {
        name: 'Colombo',
        towns: [
          { name: 'Colombo 01 - Fort', postalCode: '00100' },
          { name: 'Colombo 03 - Kollupitiya', postalCode: '00300' },
          { name: 'Colombo 07 - Cinnamon Gardens', postalCode: '00700' },
          { name: 'Dehiwala', postalCode: '10350' },
          { name: 'Mount Lavinia', postalCode: '10370' },
          { name: 'Nugegoda', postalCode: '10250' },
          { name: 'Maharagama', postalCode: '10280' },
          { name: 'Kottawa', postalCode: '10230' }
        ]
      },
      {
        name: 'Gampaha',
        towns: [
          { name: 'Gampaha', postalCode: '11000' },
          { name: 'Negombo', postalCode: '11500' },
          { name: 'Kelaniya', postalCode: '11600' },
          { name: 'Kadawatha', postalCode: '11850' },
          { name: 'Wattala', postalCode: '11300' }
        ]
      },
      {
        name: 'Kalutara',
        towns: [
          { name: 'Kalutara', postalCode: '12000' },
          { name: 'Panadura', postalCode: '12500' },
          { name: 'Horana', postalCode: '12400' },
          { name: 'Beruwala', postalCode: '12070' }
        ]
      }
    ]
  },
  {
    name: 'Southern Province',
    districts: [
      {
        name: 'Galle',
        towns: [
          { name: 'Galle Fort', postalCode: '80000' },
          { name: 'Hikkaduwa', postalCode: '80240' },
          { name: 'Unawatuna', postalCode: '80600' },
          { name: 'Ambalangoda', postalCode: '80300' }
        ]
      },
      {
        name: 'Matara',
        towns: [
          { name: 'Matara City', postalCode: '81000' },
          { name: 'Mirissa', postalCode: '81740' },
          { name: 'Weligama', postalCode: '81700' },
          { name: 'Dikwella', postalCode: '81200' }
        ]
      },
      {
        name: 'Hambantota',
        towns: [
          { name: 'Hambantota', postalCode: '82000' },
          { name: 'Tangalle', postalCode: '82200' },
          { name: 'Weeraketiya', postalCode: '82240' },
          { name: 'Tissamaharama', postalCode: '82600' }
        ]
      }
    ]
  },
  {
    name: 'Central Province',
    districts: [
      {
        name: 'Kandy',
        towns: [
          { name: 'Kandy City', postalCode: '20000' },
          { name: 'Peradeniya', postalCode: '20400' },
          { name: 'Katugastota', postalCode: '20120' }
        ]
      },
      {
        name: 'Matale',
        towns: [
          { name: 'Matale', postalCode: '21000' },
          { name: 'Dambulla', postalCode: '21100' },
          { name: 'Sigiriya', postalCode: '21120' }
        ]
      },
      {
        name: 'Nuwara Eliya',
        towns: [
          { name: 'Nuwara Eliya', postalCode: '22200' },
          { name: 'Hatton', postalCode: '22000' },
          { name: 'Ella', postalCode: '90090' }
        ]
      }
    ]
  },
  {
    name: 'North Western Province',
    districts: [
      {
        name: 'Kurunegala',
        towns: [
          { name: 'Kurunegala City', postalCode: '60000' },
          { name: 'Kuliyapitiya', postalCode: '60200' },
          { name: 'Narammala', postalCode: '60100' }
        ]
      },
      {
        name: 'Puttalam',
        towns: [
          { name: 'Puttalam', postalCode: '61300' },
          { name: 'Chilaw', postalCode: '61000' },
          { name: 'Wennappuwa', postalCode: '61170' }
        ]
      }
    ]
  },
  {
    name: 'North Central Province',
    districts: [
      {
        name: 'Anuradhapura',
        towns: [
          { name: 'Anuradhapura Town', postalCode: '50000' },
          { name: 'Kekirawa', postalCode: '50100' }
        ]
      },
      {
        name: 'Polonnaruwa',
        towns: [
          { name: 'Polonnaruwa', postalCode: '51000' },
          { name: 'Kaduruwela', postalCode: '51000' }
        ]
      }
    ]
  },
  {
    name: 'Eastern Province',
    districts: [
      {
        name: 'Trincomalee',
        towns: [
          { name: 'Trincomalee Town', postalCode: '31000' }
        ]
      },
      {
        name: 'Batticaloa',
        towns: [
          { name: 'Batticaloa Town', postalCode: '30000' }
        ]
      },
      {
        name: 'Ampara',
        towns: [
          { name: 'Ampara Town', postalCode: '32000' }
        ]
      }
    ]
  },
  {
    name: 'Northern Province',
    districts: [
      {
        name: 'Jaffna',
        towns: [
          { name: 'Jaffna City', postalCode: '40000' }
        ]
      },
      {
        name: 'Kilinochchi',
        towns: [{ name: 'Kilinochchi Town', postalCode: '44000' }]
      },
      {
        name: 'Mannar',
        towns: [{ name: 'Mannar Town', postalCode: '41000' }]
      },
      {
        name: 'Vavuniya',
        towns: [{ name: 'Vavuniya Town', postalCode: '43000' }]
      },
      {
        name: 'Mullaitivu',
        towns: [{ name: 'Mullaitivu Town', postalCode: '42000' }]
      }
    ]
  },
  {
    name: 'Uva Province',
    districts: [
      {
        name: 'Badulla',
        towns: [{ name: 'Badulla Town', postalCode: '90000' }, { name: 'Bandarawela', postalCode: '90100' }]
      },
      {
        name: 'Monaragala',
        towns: [{ name: 'Monaragala Town', postalCode: '91000' }]
      }
    ]
  },
  {
    name: 'Sabaragamuwa Province',
    districts: [
      {
        name: 'Ratnapura',
        towns: [{ name: 'Ratnapura City', postalCode: '70000' }]
      },
      {
        name: 'Kegalle',
        towns: [{ name: 'Kegalle Town', postalCode: '71000' }]
      }
    ]
  }
];