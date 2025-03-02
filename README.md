# \[unwrap]

Running:

```bash
# Bun
bunx @templ8/unwrap --help

# Node
npx @templ8/unwrap --help

# Global install
bun install -g @templ8/unwrap
unwrap --help
```

## Commands

- `init` - Initialize a new project.
- `help` - Display help information.
- `license` - Generate a license file.
  - `--dry-run` - Test the command and see the output.
- `ng` - Generate an Angular element.
  - `--dry-run` - Test the command and see the output.

## Templates

The following templates are available out of the box:

### License

Generates one of the following licenses:

- Apache 2.0
- MIT

**Example:**

```
# Generate a license file
unwrap license

# Test the command and see the output
unwrap license --dry-run
```

### Angular

Generates one of the following Angular elements:

- [ ] Component
- [ ] Directive
- [ ] Module
- [ ] Pipe
- [x] Service

**Example:**

```bash
unwrap ng

# Test the command and see the output
unwrap ng --dry-run
```

Running with the `Service` option produces the following output for the `AppConfig` name:

**app-config.service.ts**
```typescript
@Injectable({
  providedIn: 'root'
})
export class AppConfigService {
}
```

**app-config.service.spec.ts**
```typescript
import { TestBed } from '@angular/core/testing';
import { AppConfigService } from './app-config.service';

describe('AppConfigService', () => {
    let service: AppConfigService;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(AppConfigService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });
});
```

## Development

To install dependencies:

```bash
bun install
```

To run:

```bash
bun run index.ts
```

### Linking

```bash
bun link
```

Now you can run `unwrap` from anywhere.
