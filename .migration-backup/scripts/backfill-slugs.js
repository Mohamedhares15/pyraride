"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var client_1 = require("@prisma/client");
var prisma = new client_1.PrismaClient();
function slugify(name) {
    return name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)+/g, '');
}
function backfillSlugs() {
    return __awaiter(this, void 0, void 0, function () {
        var stables, _i, stables_1, stable, baseSlug, uniqueSlug, counter, existing;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    console.log("Fetching stables with missing slugs...");
                    return [4 /*yield*/, prisma.stable.findMany({
                            where: { slug: null },
                        })];
                case 1:
                    stables = _a.sent();
                    console.log("Found ".concat(stables.length, " stables without a slug."));
                    _i = 0, stables_1 = stables;
                    _a.label = 2;
                case 2:
                    if (!(_i < stables_1.length)) return [3 /*break*/, 8];
                    stable = stables_1[_i];
                    baseSlug = slugify(stable.name);
                    if (!baseSlug)
                        baseSlug = "stable-".concat(stable.id.slice(0, 8));
                    uniqueSlug = baseSlug;
                    counter = 1;
                    _a.label = 3;
                case 3:
                    if (!true) return [3 /*break*/, 5];
                    return [4 /*yield*/, prisma.stable.findUnique({ where: { slug: uniqueSlug } })];
                case 4:
                    existing = _a.sent();
                    if (!existing)
                        return [3 /*break*/, 5];
                    uniqueSlug = "".concat(baseSlug, "-").concat(counter);
                    counter++;
                    return [3 /*break*/, 3];
                case 5: return [4 /*yield*/, prisma.stable.update({
                        where: { id: stable.id },
                        data: { slug: uniqueSlug },
                    })];
                case 6:
                    _a.sent();
                    console.log("Updated stable \"".concat(stable.name, "\" with slug => \"").concat(uniqueSlug, "\""));
                    _a.label = 7;
                case 7:
                    _i++;
                    return [3 /*break*/, 2];
                case 8:
                    console.log("Backfill complete.");
                    return [4 /*yield*/, prisma.$disconnect()];
                case 9:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    });
}
backfillSlugs().catch(function (e) {
    console.error(e);
    process.exit(1);
});
