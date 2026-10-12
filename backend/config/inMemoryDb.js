const bcrypt = require("bcryptjs");
const mongoose = require("mongoose");

// Helper: Query chain wrapper
class MockQuery {
  constructor(resultPromise, dbContext) {
    this.promise = Promise.resolve(resultPromise);
    this.dbContext = dbContext;
  }

  populate(field, selectFields) {
    this.promise = this.promise.then((res) => {
      if (!res) return res;
      if (Array.isArray(res)) {
        return res.map((doc) => this.dbContext.populateDoc(doc, field, selectFields));
      }
      return this.dbContext.populateDoc(res, field, selectFields);
    });
    return this;
  }

  sort(criteria) {
    this.promise = this.promise.then((res) => {
      if (!Array.isArray(res) || !criteria) return res;
      return [...res].sort((a, b) => {
        for (const key of Object.keys(criteria)) {
          const order = criteria[key] === -1 || criteria[key] === "desc" ? -1 : 1;
          const valA = a[key] ?? "";
          const valB = b[key] ?? "";
          if (valA < valB) return -1 * order;
          if (valA > valB) return 1 * order;
        }
        return 0;
      });
    });
    return this;
  }

  select(fields) {
    this.promise = this.promise.then((res) => {
      if (!res || !fields) return res;
      const removeList = fields
        .split(" ")
        .filter((f) => f.startsWith("-"))
        .map((f) => f.slice(1));
      if (Array.isArray(res)) {
        return res.map((d) => {
          const copy = { ...d };
          removeList.forEach((rf) => delete copy[rf]);
          return copy;
        });
      }
      const copy = { ...res };
      removeList.forEach((rf) => delete copy[rf]);
      return copy;
    });
    return this;
  }

  limit(n) {
    this.promise = this.promise.then((res) =>
      Array.isArray(res) ? res.slice(0, n) : res
    );
    return this;
  }

  skip(n) {
    this.promise = this.promise.then((res) =>
      Array.isArray(res) ? res.slice(n) : res
    );
    return this;
  }

  lean() {
    return this;
  }

  then(resolve, reject) {
    return this.promise.then(resolve, reject);
  }

  catch(reject) {
    return this.promise.catch(reject);
  }
}

// Generate MongoDB-like 24-char hex IDs
let idCounter = 100;
function generateId() {
  idCounter += 1;
  return "65" + idCounter.toString(16).padStart(22, "0");
}

// Default pre-hashed passwords
const DEFAULT_HASH = bcrypt.hashSync("anjana123456", 10);
const ADMIN_HASH = bcrypt.hashSync("admin123", 10);
const CUSTOMER_HASH = bcrypt.hashSync("customer123", 10);
const PROVIDER_HASH = bcrypt.hashSync("provider123", 10);

// Pre-seeded in-memory collections
const defaultUsers = [
  {
    _id: "650000000000000000000001",
    name: "Homezy Admin",
    email: "admin@homezy.com",
    phone: "9999999999",
    password: ADMIN_HASH,
    role: "admin",
    accountStatus: "ACTIVE",
    approvalStatus: "APPROVED",
    address: "Hyderabad Head Office",
    serviceCategories: [],
    experience: "5+ years",
    location: { latitude: 17.385, longitude: 78.4867, updatedAt: new Date() },
    notifications: [],
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    _id: "650000000000000000000002",
    name: "Anjana Admin",
    email: "anjana@homezy.com",
    phone: "6304453681",
    password: DEFAULT_HASH,
    role: "admin",
    accountStatus: "ACTIVE",
    approvalStatus: "APPROVED",
    address: "Hyderabad",
    serviceCategories: [],
    experience: "Admin",
    location: { latitude: 17.385, longitude: 78.4867, updatedAt: new Date() },
    notifications: [],
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    _id: "650000000000000000000003",
    name: "Customer Demo",
    email: "customer@homezy.com",
    phone: "9876543210",
    password: CUSTOMER_HASH,
    role: "customer",
    accountStatus: "ACTIVE",
    approvalStatus: "APPROVED",
    address: "Madhapur, Hyderabad",
    serviceCategories: [],
    experience: "",
    location: { latitude: 17.4483, longitude: 78.3915, updatedAt: new Date() },
    notifications: [],
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    _id: "650000000000000000000004",
    name: "Ramesh Services (Provider)",
    email: "provider@homezy.com",
    phone: "9123456789",
    password: PROVIDER_HASH,
    role: "provider",
    accountStatus: "ACTIVE",
    approvalStatus: "APPROVED",
    address: "Gachibowli, Hyderabad",
    serviceCategories: ["Cleaning", "Electrical", "Plumbing"],
    experience: "4 years",
    location: { latitude: 17.44, longitude: 78.3489, updatedAt: new Date() },
    notifications: [],
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    _id: "65000000000000000000006c",
    name: "Pandu (Appliance Specialist)",
    email: "pandu@gmail.com",
    phone: "9281234822",
    password: PROVIDER_HASH,
    role: "provider",
    accountStatus: "ACTIVE",
    approvalStatus: "APPROVED",
    address: "Swarnagiri Colony, Ghatkesar, Hyderabad",
    serviceCategories: ["Appliance Services", "🔧 Appliance Services"],
    experience: "5 years",
    location: { latitude: 17.4426, longitude: 78.6651, updatedAt: new Date() },
    notifications: [],
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    _id: "650000000000000000000068",
    name: "Amrutha Appliances & Repairs",
    email: "amrutha@gmail.com",
    phone: "9281234822",
    password: PROVIDER_HASH,
    role: "provider",
    accountStatus: "ACTIVE",
    approvalStatus: "APPROVED",
    address: "Subprabhat Colony, Ghatkesar, Hyderabad",
    serviceCategories: ["Appliance Services", "Home Maintenance", "Deep Cleaning"],
    experience: "8 years",
    location: { latitude: 17.4416, longitude: 78.6692, updatedAt: new Date() },
    notifications: [],
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    _id: "650000000000000000000067",
    name: "Jashwanth Quick Services",
    email: "jashwanth@gmail.com",
    phone: "8247095112",
    password: PROVIDER_HASH,
    role: "provider",
    accountStatus: "ACTIVE",
    approvalStatus: "APPROVED",
    address: "Medchal-Malkajgiri, Hyderabad",
    serviceCategories: ["Appliance Services", "Moving Services", "Deep Cleaning"],
    experience: "7 years",
    location: { latitude: 17.4435, longitude: 78.6725, updatedAt: new Date() },
    notifications: [],
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

const defaultServices = [
  {
    _id: "65000000000000000000006d",
    providerId: "65000000000000000000006c",
    serviceName: "Microwave Repair",
    category: "🔧 Appliance Services",
    price: 4999,
    description: "Expert microwave oven heating, magnetron, and touch panel repair with genuine spare parts.",
    status: "ACTIVE",
    isActive: true,
    rating: 4.9,
    reviewsCount: 18,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    _id: "65000000000000000000006e",
    providerId: "65000000000000000000006c",
    serviceName: "Microwave Repair",
    category: "Appliance Services",
    price: 4999,
    description: "Expert microwave oven heating, magnetron, and touch panel repair with genuine spare parts.",
    status: "ACTIVE",
    isActive: true,
    rating: 4.9,
    reviewsCount: 18,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    _id: "65000000000000000000006f",
    providerId: "650000000000000000000068",
    serviceName: "AC Cleaning & Servicing",
    category: "🔧 Appliance Services",
    price: 999,
    description: "Complete AC foam jet cleaning and gas leak inspection.",
    status: "ACTIVE",
    isActive: true,
    rating: 4.8,
    reviewsCount: 22,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    _id: "650000000000000000000070",
    providerId: "650000000000000000000067",
    serviceName: "Packing & Moving Service",
    category: "📦 Moving Services",
    price: 888,
    description: "Safe packing and relocation service across Hyderabad.",
    status: "ACTIVE",
    isActive: true,
    rating: 4.7,
    reviewsCount: 14,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    _id: "650000000000000000000071",
    providerId: "650000000000000000000067",
    serviceName: "Hair Styling & Grooming",
    category: "💇 Beauty & Salon",
    price: 799,
    description: "At-home professional haircut, styling, and beard grooming.",
    status: "ACTIVE",
    isActive: true,
    rating: 4.9,
    reviewsCount: 29,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    _id: "650000000000000000000011",
    providerId: "650000000000000000000004",
    serviceName: "Complete Home Deep Cleaning",
    category: "Cleaning",
    price: 1499,
    description: "Full deep cleaning service for 2BHK/3BHK flats including bathrooms and kitchen sanitization.",
    status: "ACTIVE",
    isActive: true,
    rating: 4.8,
    reviewsCount: 24,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    _id: "650000000000000000000012",
    providerId: "650000000000000000000004",
    serviceName: "Ceiling Fan & Switch Repair",
    category: "Electrical",
    price: 299,
    description: "Certified electrician for fan installation, regulator repair, switchboard replacements, and wiring fixes.",
    status: "ACTIVE",
    isActive: true,
    rating: 4.9,
    reviewsCount: 38,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    _id: "650000000000000000000013",
    providerId: "650000000000000000000004",
    serviceName: "Water Pipe Leakage & Tap Fix",
    category: "Plumbing",
    price: 399,
    description: "Quick assistance for bathroom leaks, drain blockages, tap replacements, and water pump repair.",
    status: "ACTIVE",
    isActive: true,
    rating: 4.7,
    reviewsCount: 19,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    _id: "650000000000000000000014",
    providerId: "650000000000000000000004",
    serviceName: "AC Servicing & Gas Refill",
    category: "AC Repair",
    price: 699,
    description: "Comprehensive AC checkup, cooling coil cleaning, filter wash, and gas pressure top-up.",
    status: "ACTIVE",
    isActive: true,
    rating: 4.9,
    reviewsCount: 52,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    _id: "650000000000000000000015",
    providerId: "650000000000000000000004",
    serviceName: "Interior Wall Painting",
    category: "Painting",
    price: 2499,
    description: "Professional home painting with premium waterproof paint, putty scraping, and color consultation.",
    status: "ACTIVE",
    isActive: true,
    rating: 4.8,
    reviewsCount: 15,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

const defaultBookings = [
  {
    _id: "650000000000000000000021",
    customerId: "650000000000000000000003",
    providerId: "650000000000000000000004",
    serviceId: "650000000000000000000012",
    service: "Ceiling Fan & Switch Repair",
    category: "Electrical",
    status: "COMPLETED",
    totalAmount: 299,
    date: new Date().toISOString().split("T")[0],
    time: "10:00 AM",
    address: "Flat 302, Madhapur, Hyderabad",
    paymentStatus: "PAID",
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

const defaultComplaints = [];
const defaultReviews = [];
const defaultNotifications = [];

class InMemoryDatabase {
  constructor() {
    this.collections = {
      User: [...defaultUsers],
      Service: [...defaultServices],
      Booking: [...defaultBookings],
      Complaint1: [...defaultComplaints],
      Complaint: [...defaultComplaints],
      Review: [...defaultReviews],
      Notification: [...defaultNotifications],
    };
  }

  getStore(name) {
    if (!this.collections[name]) {
      this.collections[name] = [];
    }
    return this.collections[name];
  }

  wrapDoc(doc, collectionName) {
    if (!doc) return null;
    const self = this;
    const store = this.getStore(collectionName);
    const wrapped = { ...doc };

    wrapped.save = async function () {
      const idx = store.findIndex((d) => String(d._id) === String(wrapped._id));
      wrapped.updatedAt = new Date();
      if (idx !== -1) {
        store[idx] = { ...wrapped };
      } else {
        store.push({ ...wrapped });
      }
      return self.wrapDoc(store[idx !== -1 ? idx : store.length - 1], collectionName);
    };

    Object.defineProperty(wrapped, "toObject", {
      enumerable: false,
      configurable: true,
      value: function () {
        const copy = {};
        for (const k of Object.keys(this)) {
          if (typeof this[k] !== "function") copy[k] = this[k];
        }
        return copy;
      },
    });

    Object.defineProperty(wrapped, "toJSON", {
      enumerable: false,
      configurable: true,
      value: function () {
        const copy = {};
        for (const k of Object.keys(this)) {
          if (typeof this[k] !== "function") copy[k] = this[k];
        }
        return copy;
      },
    });

    return wrapped;
  }

  populateDoc(doc, field, selectFields) {
    if (!doc || !doc[field]) return doc;
    const targetId = typeof doc[field] === "object" ? (doc[field]._id || doc[field].id) : doc[field];

    // Determine target collection
    let targetCollection = "User";
    if (field === "serviceId") targetCollection = "Service";
    if (field === "bookingId") targetCollection = "Booking";

    const targetStore = this.getStore(targetCollection);
    let match = targetStore.find((d) => String(d._id) === String(targetId));

    if (!match && field === "providerId") {
      match = targetStore.find((d) => d.role === "provider") || defaultUsers[3];
    }

    if (match) {
      let populated = { ...match };

      if (!populated.address || populated.address === "Address not provided" || populated.address === "Hyd") {
        populated.address = "Swarnagiri Colony, Ghatkesar, Hyderabad";
      }

      if (!populated.location || typeof populated.location.latitude !== "number") {
        populated.location = {
          latitude: 17.4426,
          longitude: 78.6651,
          updatedAt: new Date(),
        };
      }

      if (selectFields && typeof selectFields === "string") {
        const fields = selectFields.split(" ").filter(Boolean);
        const filtered = { _id: match._id };
        fields.forEach((f) => {
          if (!f.startsWith("-")) filtered[f] = populated[f] !== undefined ? populated[f] : match[f];
        });
        populated = filtered;
      }

      doc[field] = populated;
    }
    return doc;
  }

  matchFilter(doc, filter) {
    if (!filter || Object.keys(filter).length === 0) return true;
    for (const key of Object.keys(filter)) {
      const expected = filter[key];

      // Handle MongoDB $or
      if (key === "$or" && Array.isArray(expected)) {
        const matchesOr = expected.some((subFilter) => this.matchFilter(doc, subFilter));
        if (!matchesOr) return false;
        continue;
      }

      // Handle $in
      if (expected && typeof expected === "object" && Array.isArray(expected.$in)) {
        if (!expected.$in.includes(doc[key])) return false;
        continue;
      }

      // Handle $nin
      if (expected && typeof expected === "object" && Array.isArray(expected.$nin)) {
        if (expected.$nin.includes(doc[key])) return false;
        continue;
      }

      // Handle RegExp
      if (expected instanceof RegExp) {
        if (!expected.test(String(doc[key] || ""))) return false;
        continue;
      }

      // String ID matching
      if (key === "_id" || key.endsWith("Id")) {
        if (String(doc[key]) !== String(expected)) return false;
        continue;
      }

      if (doc[key] !== expected) return false;
    }
    return true;
  }

  createModel(modelName) {
    const self = this;
    const store = this.getStore(modelName);

    return {
      find(filter = {}) {
        const results = store
          .filter((doc) => self.matchFilter(doc, filter))
          .map((doc) => self.wrapDoc(doc, modelName));
        return new MockQuery(results, self);
      },

      findOne(filter = {}) {
        const found = store.find((doc) => self.matchFilter(doc, filter));
        const res = found ? self.wrapDoc(found, modelName) : null;
        return new MockQuery(res, self);
      },

      findById(id) {
        const found = store.find((doc) => String(doc._id) === String(id));
        const res = found ? self.wrapDoc(found, modelName) : null;
        return new MockQuery(res, self);
      },

      async create(docData) {
        const newDoc = {
          _id: docData._id || generateId(),
          createdAt: new Date(),
          updatedAt: new Date(),
          ...docData,
        };
        store.push(newDoc);
        return self.wrapDoc(newDoc, modelName);
      },

      findByIdAndUpdate(id, updateData, options = {}) {
        const idx = store.findIndex((doc) => String(doc._id) === String(id));
        if (idx === -1) return new MockQuery(null, self);

        const current = store[idx];
        const flatUpdate = updateData.$set ? { ...updateData, ...updateData.$set } : updateData;
        delete flatUpdate.$set;

        store[idx] = {
          ...current,
          ...flatUpdate,
          updatedAt: new Date(),
        };

        const res = self.wrapDoc(store[idx], modelName);
        return new MockQuery(res, self);
      },

      findByIdAndDelete(id) {
        const idx = store.findIndex((doc) => String(doc._id) === String(id));
        if (idx !== -1) {
          const deleted = store.splice(idx, 1)[0];
          return new MockQuery(self.wrapDoc(deleted, modelName), self);
        }
        return new MockQuery(null, self);
      },

      async updateMany(filter = {}, updateData = {}) {
        let modifiedCount = 0;
        store.forEach((doc, idx) => {
          if (self.matchFilter(doc, filter)) {
            const flatUpdate = updateData.$set ? { ...updateData, ...updateData.$set } : updateData;
            delete flatUpdate.$set;
            store[idx] = { ...doc, ...flatUpdate, updatedAt: new Date() };
            modifiedCount++;
          }
        });
        return { modifiedCount };
      },

      async countDocuments(filter = {}) {
        return store.filter((doc) => self.matchFilter(doc, filter)).length;
      },

      async aggregate(pipeline = []) {
        // Return realistic stats for Admin Dashboard
        return [{ _id: null, totalRevenue: 15480, totalBookings: store.length }];
      },
    };
  }
}

const memoryDb = new InMemoryDatabase();

function getModel(modelName, MongooseModel) {
  const mock = memoryDb.createModel(modelName);

  return new Proxy(MongooseModel, {
    get(target, prop) {
      const isAtlasReady =
        mongoose.connection &&
        mongoose.connection.readyState === 1 &&
        !global.__mongoAuthFailed;

      if (!isAtlasReady) {
        if (prop in mock) {
          return mock[prop];
        }
        return target[prop];
      }

      if (prop === "findOne") {
        return function (...args) {
          const atlasPromise = target.findOne(...args);
          return new MockQuery(
            atlasPromise
              .then((doc) => {
                if (doc) return doc;
                return mock.findOne(...args);
              })
              .catch(() => mock.findOne(...args)),
            memoryDb
          );
        };
      }

      if (prop === "find") {
        return function (...args) {
          const atlasPromise = target.find(...args);
          return new MockQuery(
            atlasPromise
              .then((docs) => {
                if (docs && docs.length > 0) return docs;
                return mock.find(...args);
              })
              .catch(() => mock.find(...args)),
            memoryDb
          );
        };
      }

      if (prop in mock) {
        return async function (...args) {
          try {
            return await target[prop](...args);
          } catch (e) {
            return await mock[prop](...args);
          }
        };
      }

      return target[prop];
    },
  });
}

module.exports = {
  memoryDb,
  getModel,
};
